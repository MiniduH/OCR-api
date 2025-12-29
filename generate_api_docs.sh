#!/bin/bash

# Configuration
BASE_URL="http://localhost:5001" # Defaulting to 5001 as per previous successful runs, but user can change
OUTPUT_FILE="public_api_responses.md"

# List of endpoints
ENDPOINTS=(
  "/api/web/all/1001"
  "/api/web/config/1001"
  "/api/web/colors/1001"
  "/api/web/company/1001"
  "/api/web/contact/1001"
  "/api/web/enforcement/1001"
  "/api/web/nav-bar/1001"
  "/api/web/hero/1001"
  "/api/web/footer/1001"
  "/api/web/discover-solutions/1001"
  "/api/web/testimonials/1001"
  "/api/web/solutions/1001"
)

# Initialize output file
echo "# Public API Responses" > "$OUTPUT_FILE"
echo "Generated on $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "🚀 Generating API documentation..."

for endpoint in "${ENDPOINTS[@]}"; do
  url="${BASE_URL}${endpoint}"
  echo "Fetching $url..."
  
  echo "## GET $endpoint" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "\`\`\`json" >> "$OUTPUT_FILE"
  
  # Fetch and format JSON
  curl -s "$url" | python3 -m json.tool >> "$OUTPUT_FILE"
  
  echo "\`\`\`" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  echo "---" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
done

echo "✅ Documentation generated at: $OUTPUT_FILE"
