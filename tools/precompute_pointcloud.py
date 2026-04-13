"""
precompute_pointcloud.py
Generate a pre-baked binary pointcloud from a photo + matching depth map.

Two sampling modes:
  --stride N   (default) — sample every N pixels on a regular grid
  --block  N   — divide image into NxN pixel blocks; each block → one point
                 with averaged color + depth. Gives fewer, larger-feeling dots.
                 Example: --block 20 on 800×800 → ~200 points in the circle.

Usage:
    python precompute_pointcloud.py \
        --photo  "path/to/photo.png" \
        --depth  "path/to/depth.png" \
        --output "path/to/pointcloud.bin" \
        [--stride 6 | --block 20] [--z-scale 0.4] [--max-points 80000] [--resize 800]

Binary format (little-endian):
    4 bytes  — uint32  N
    N*3*4    — float32 positions (x,y,z, normalised to ~[-1,1])
    N*3*4    — float32 colors    (r,g,b, normalised to [0,1])
"""

import argparse
import math
import struct
from pathlib import Path

from PIL import Image
import numpy as np

# Tight circular mask: trim this fraction of the radius to remove edge outliers
RADIUS_TRIM = 0.95


def build_stride(photo_arr, depth_arr, W, H, stride, z_scale):
    """Sample every `stride` pixels on a grid inside the trimmed circle."""
    cx, cy = W / 2.0, H / 2.0
    radius = min(cx, cy) * RADIUS_TRIM

    ys = np.arange(0, H, stride)
    xs = np.arange(0, W, stride)
    grid_x, grid_y = np.meshgrid(xs, ys)
    grid_x = grid_x.flatten().astype(np.float32)
    grid_y = grid_y.flatten().astype(np.float32)

    dx = grid_x - cx
    dy = grid_y - cy

    in_circle = np.hypot(dx, dy) <= radius
    xi = grid_x.astype(int)
    yi = grid_y.astype(int)
    in_alpha  = photo_arr[yi, xi, 3] >= 128
    mask = in_circle & in_alpha

    xi, yi, dx, dy = xi[mask], yi[mask], dx[mask], dy[mask]

    x = ( dx / radius).astype(np.float32)
    y = (-dy / radius).astype(np.float32)
    z = (depth_arr[yi, xi] / 255.0 * z_scale).astype(np.float32)
    r = (photo_arr[yi, xi, 0] / 255.0).astype(np.float32)
    g = (photo_arr[yi, xi, 1] / 255.0).astype(np.float32)
    b = (photo_arr[yi, xi, 2] / 255.0).astype(np.float32)

    return np.stack([x, y, z], axis=1), np.stack([r, g, b], axis=1)


def build_block(photo_arr, depth_arr, W, H, block, z_scale):
    """
    Divide image into block×block pixel cells.
    Average colour + depth inside each cell → one point per cell.
    Only cells whose centre is inside the trimmed circle AND have enough
    non-transparent pixels are kept.
    """
    cx, cy = W / 2.0, H / 2.0
    radius = min(cx, cy) * RADIUS_TRIM

    positions, colors = [], []

    for row in range(0, H, block):
        for col in range(0, W, block):
            # Cell centre
            pcx = col + block / 2.0
            pcy = row + block / 2.0

            dx = pcx - cx
            dy = pcy - cy
            if math.hypot(dx, dy) > radius:
                continue

            # Crop the block, skip if it overflows image bounds
            r0, r1 = row, min(row + block, H)
            c0, c1 = col, min(col + block, W)

            patch_photo = photo_arr[r0:r1, c0:c1]   # h×w×4
            patch_depth = depth_arr[r0:r1, c0:c1]   # h×w

            # Require at least half the patch pixels to be non-transparent
            alpha_mask = patch_photo[:, :, 3] >= 128
            if alpha_mask.sum() < (alpha_mask.size * 0.5):
                continue

            # Average over non-transparent pixels only
            valid = alpha_mask
            avg_r = patch_photo[:, :, 0][valid].mean() / 255.0
            avg_g = patch_photo[:, :, 1][valid].mean() / 255.0
            avg_b = patch_photo[:, :, 2][valid].mean() / 255.0
            avg_z = patch_depth[valid].mean() / 255.0 * z_scale

            x =  dx / radius
            y = -dy / radius

            positions.append([x, y, avg_z])
            colors.append([avg_r, avg_g, avg_b])

    return (
        np.array(positions, dtype=np.float32),
        np.array(colors,    dtype=np.float32),
    )


def build_pointcloud(
    photo_path: str,
    depth_path: str,
    stride: int = 6,
    block: int  = 0,          # 0 = use stride mode
    z_scale: float = 0.4,
    max_points: int = 80_000,
    resize: int = 800,
):
    photo = Image.open(photo_path).convert("RGBA")
    depth = Image.open(depth_path).convert("L")

    if resize and max(photo.size) > resize:
        photo = photo.resize((resize, resize), Image.LANCZOS)
        print(f"[precompute] Resized photo → {resize}×{resize}")

    if depth.size != photo.size:
        depth = depth.resize(photo.size, Image.LANCZOS)

    W, H = photo.size
    photo_arr = np.array(photo, dtype=np.float32)
    depth_arr = np.array(depth, dtype=np.float32)

    if block and block > 0:
        positions, colors = build_block(photo_arr, depth_arr, W, H, block, z_scale)
        mode = f"block={block}"
    else:
        positions, colors = build_stride(photo_arr, depth_arr, W, H, stride, z_scale)
        mode = f"stride={stride}"

    n = len(positions)
    if n > max_points:
        idx = np.random.choice(n, max_points, replace=False)
        positions = positions[idx]
        colors    = colors[idx]
        n = max_points

    print(f"[precompute] {n} points ({mode}, photo {W}×{H})")
    return positions, colors


def main():
    parser = argparse.ArgumentParser(description="Precompute binary pointcloud from photo + depth")
    parser.add_argument("--photo",      required=True,  help="Input photo (PNG with alpha, circular-cropped)")
    parser.add_argument("--depth",      required=True,  help="Matching depth map (grayscale PNG)")
    parser.add_argument("--output",     required=True,  help="Output .bin file path")
    parser.add_argument("--stride",     type=int,   default=6,      help="Sample every N pixels (default: 6)")
    parser.add_argument("--block",      type=int,   default=0,      help="Block-average mode: NxN px per point (overrides --stride)")
    parser.add_argument("--z-scale",    type=float, default=0.4,    help="Depth exaggeration factor (default: 0.4)")
    parser.add_argument("--max-points", type=int,   default=80_000, help="Max point count (default: 80000)")
    parser.add_argument("--resize",     type=int,   default=800,    help="Downscale image to this px size before sampling (default: 800)")
    args = parser.parse_args()

    positions, colors = build_pointcloud(
        photo_path=args.photo,
        depth_path=args.depth,
        stride=args.stride,
        block=args.block,
        z_scale=args.z_scale,
        max_points=args.max_points,
        resize=args.resize,
    )

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    n = len(positions)
    with open(out, "wb") as f:
        f.write(struct.pack("<I", n))
        f.write(positions.astype("<f4").tobytes())
        f.write(colors.astype("<f4").tobytes())

    size_kb = out.stat().st_size / 1024
    print(f"[precompute] Saved → {out}  ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
