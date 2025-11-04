#!/bin/sh
set -e

find ./.next -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -print0 | while read -r -d $'\0' file; do
    sed -i "s|__NEXT_PUBLIC_DEFAULT_AVATAR_URL__|${NEXT_PUBLIC_DEFAULT_AVATAR_URL}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_GITHUB_AUTH_ENABLED__|${NEXT_PUBLIC_GITHUB_AUTH_ENABLED}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_DISCORD_AUTH_ENABLED__|${NEXT_PUBLIC_DISCORD_AUTH_ENABLED}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_GOOGLE_AUTH_ENABLED__|${NEXT_PUBLIC_GOOGLE_AUTH_ENABLED}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_EMAIL_AUTH_ENABLED__|${NEXT_PUBLIC_EMAIL_AUTH_ENABLED}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_PAYMENTS_ENABLED__|${NEXT_PUBLIC_PAYMENTS_ENABLED}|g" "$file"
    sed -i "s|__TIERS_JSON__|${TIERS_JSON}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_APP_DESC__|${NEXT_PUBLIC_APP_DESC}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_API_URL__|${NEXT_PUBLIC_API_URL}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_FOOTER_LINKS__|${NEXT_PUBLIC_FOOTER_LINKS}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_NAVBAR_LINKS__|${NEXT_PUBLIC_NAVBAR_LINKS}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_FRONTEND_URL__|${NEXT_PUBLIC_FRONTEND_URL}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_APP_NAME__|${NEXT_PUBLIC_APP_NAME}|g" "$file"
    sed -i "s|__NEXT_PUBLIC_UPLOAD_LIMIT_BYTES__|${NEXT_PUBLIC_UPLOAD_LIMIT_BYTES}|g" "$file"
done

exec "$@"
