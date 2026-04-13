"""
precompute_pointcloud.py
Generate a pre-baked binary pointcloud from a photo + matching depth map.

Usage:
    python precompute_pointcloud.py \
        --photo  "path/to/photo.png" \
        --depth  "path/to/depth.png" \
        --output "path/to/pointcloud.bin" \
        [--stride 3] [--z-scale 0.4] [--max-points 80000] [--resize 800]

Binary format (little-endian):
    4 bytes  — uint32  N  (number of points)
    N*3*4    — float32    positions (x,y,z interleaved, normalised to ~[-1,1])
    N*3*4    — float32    colors    (r,g,b interleaved, normalised to [0,1])

Total size ≈ 4 + N * 24 bytes  (~1.3 MB for 55k points, vs ~3 MB JSON)
Read in JS with: new Float32Array(buffer, offset, N*3)
"""

import argparse
import math
import struct
from pathlib import Path

from PIL import Image
import numpy as np


def build_pointcloud(
    photo_path: str,
    depth_path: str,
    stride: int = 3,
    z_scale: float = 0.4,
    max_points: int = 80_000,
    resize: int = 800,
) -> tuple[np.ndarray, np.ndarray]:
    """Returns (positions, colors) as float32 numpy arrays of shape (N, 3)."""

    photo = Image.open(photo_path).convert("RGBA")
    depth = Image.open(depth_path).convert("L")

    # Downscale to target size before sampling
    if resize and max(photo.size) > resize:
        photo = photo.resize((resize, resize), Image.LANCZOS)
        print(f"[precompute] Resized photo → {resize}×{resize}")

    # Resize depth to match photo if needed
    if depth.size != photo.size:
        depth = depth.resize(photo.size, Image.LANCZOS)

    W, H = photo.size
    photo_arr = np.array(photo, dtype=np.float32)   # H×W×4  (RGBA 0-255)
    depth_arr = np.array(depth, dtype=np.float32)   # H×W    (0-255)

    # Build pixel coordinate grids
    ys = np.arange(0, H, stride)
    xs = np.arange(0, W, stride)
    grid_x, grid_y = np.meshgrid(xs, ys)
    grid_x = grid_x.flatten()
    grid_y = grid_y.flatten()

    cx, cy = W / 2.0, H / 2.0
    radius = min(cx, cy)

    dx = grid_x - cx
    dy = grid_y - cy

    # Circular mask
    in_circle = np.hypot(dx, dy) <= radius

    # Alpha mask (transparent pixels from circular crop)
    alpha = photo_arr[grid_y.astype(int), grid_x.astype(int), 3]
    in_alpha = alpha >= 128

    mask = in_circle & in_alpha
    grid_x = grid_x[mask]
    grid_y = grid_y[mask]
    dx     = dx[mask]
    dy     = dy[mask]

    xi = grid_x.astype(int)
    yi = grid_y.astype(int)

    x = ( dx / radius).astype(np.float32)
    y = (-dy / radius).astype(np.float32)   # flip Y so up is positive
    z = (depth_arr[yi, xi] / 255.0 * z_scale).astype(np.float32)

    r = (photo_arr[yi, xi, 0] / 255.0).astype(np.float32)
    g = (photo_arr[yi, xi, 1] / 255.0).astype(np.float32)
    b = (photo_arr[yi, xi, 2] / 255.0).astype(np.float32)

    positions = np.stack([x, y, z], axis=1)   # (N, 3)
    colors    = np.stack([r, g, b], axis=1)   # (N, 3)

    # Downsample if over max_points
    n = len(positions)
    if n > max_points:
        idx = np.random.choice(n, max_points, replace=False)
        positions = positions[idx]
        colors    = colors[idx]
        n = max_points

    print(f"[precompute] {n} points extracted (photo {W}×{H}, stride={stride})")
    return positions, colors


def main():
    parser = argparse.ArgumentParser(description="Precompute binary pointcloud from photo + depth")
    parser.add_argument("--photo",      required=True,  help="Input photo (PNG with alpha, circular-cropped)")
    parser.add_argument("--depth",      required=True,  help="Matching depth map (grayscale PNG)")
    parser.add_argument("--output",     required=True,  help="Output .bin file path")
    parser.add_argument("--stride",     type=int,   default=3,      help="Sample every N pixels (default: 3)")
    parser.add_argument("--z-scale",    type=float, default=0.4,    help="Depth exaggeration factor (default: 0.4)")
    parser.add_argument("--max-points", type=int,   default=80_000, help="Max point count (default: 80000)")
    parser.add_argument("--resize",     type=int,   default=800,    help="Downscale image to this size px (default: 800, 0=no resize)")
    args = parser.parse_args()

    positions, colors = build_pointcloud(
        photo_path=args.photo,
        depth_path=args.depth,
        stride=args.stride,
        z_scale=args.z_scale,
        max_points=args.max_points,
        resize=args.resize,
    )

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    n = len(positions)
    with open(out, "wb") as f:
        f.write(struct.pack("<I", n))          # uint32 point count, little-endian
        f.write(positions.astype("<f4").tobytes())
        f.write(colors.astype("<f4").tobytes())

    size_kb = out.stat().st_size / 1024
    print(f"[precompute] Saved → {out}  ({size_kb:.0f} KB)")


if __name__ == "__main__":
    main()
