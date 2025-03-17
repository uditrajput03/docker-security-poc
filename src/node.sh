#!/bin/bash
set -e

IMAGE_NAME=$1
USER_NAME=$2
TAG_NAME=$3
TMP_DIR=$(pwd)

URL=$USER_NAME/$IMAGE_NAME:$TAG_NAME
OUTPUT_DIR="${USER_NAME}/${IMAGE_NAME}/${TAG_NAME}"
echo "Starting extraction for image: $URL"
# Download the image using skopeo
skopeo --tmpdir="$TMP_DIR" --insecure-policy copy docker://"$URL" docker-archive:nginx-latest.tar

# Unpack and prepare directories
mkdir -p temp_inspect
tar -xf nginx-latest.tar -C temp_inspect
cd temp_inspect || exit 1

mkdir -p "../$OUTPUT_DIR"
touch "../$OUTPUT_DIR/found_conf_files.txt"
log_file="../$OUTPUT_DIR/found_conf_files.txt"

# Extract .conf files from each layer
for layer in *.tar; do
  echo "Searching for .conf files in $layer"
  tar -tf "$layer" | grep '\.env' | while read -r file; do 
    echo " -> Extracting $file from $layer"
    tar --extract --file="$layer" --directory="../$OUTPUT_DIR" --no-anchored "$file"
    SAFE_FILENAME=$(echo "$file" | sed 's|/|_|g')
    tar --extract --file="$layer" --to-stdout "$file" > "../$OUTPUT_DIR/$SAFE_FILENAME"
    # tar --extract --file="$layer" --to-stdout "$file" > "../$OUTPUT_DIR/$(basename "$file")"
    echo "$file" >> "$log_file"
  done
done

find -type f -name "*.json" ! -name "manifest.json" -exec cp {} "../$OUTPUT_DIR/inspect.json" \;
# Cleanup
cd ..
rm -rf temp_inspect
rm nginx-latest.tar

echo "Extraction completed!"
