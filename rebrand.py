import os
import re

replacements = {
    r'TypeHero': 'ЛитКот',
    r'Typehero': 'ЛитКот',
    r'typehero\.dev': 'leetcot.ru',
    r'typeheroapp': 'leetcot',
    r'Level up and learn TypeScript': 'Прокачивай навыки программирования вместе с котиками'
}

files_to_process = [
    ".env",
    ".env.example",
    "LOCAL.md",
    "README.md",
    "apps/admin/src/app/layout.tsx",
    "apps/aot/README.md",
    "apps/aot/src/app/(legal)/privacy/page.tsx",
    "apps/aot/src/app/(legal)/tos/page.tsx",
    "apps/aot/src/app/about/page.tsx",
    "apps/aot/src/app/events/[year]/[day]/_components/comments/enhanced-user-badge.tsx",
    "apps/aot/src/app/events/[year]/[day]/solutions/[solutionId]/page.tsx",
    "apps/aot/src/app/events/[year]/[day]/submissions/[[...catchAll]]/page.tsx",
    "apps/aot/src/app/support/page.tsx",
    "apps/aot/src/components/Partners/TypeHero.tsx",
    "apps/aot/src/components/footsies.tsx",
    "apps/aot/src/components/landing/PartnerLink.tsx",
    "apps/aot/src/components/landing/Partners.tsx",
    "apps/aot/src/components/navigation/index.tsx",
    "apps/og-image/app/page.tsx",
    "apps/web/next.config.mjs",
    "apps/web/public/site.webmanifest",
    "apps/web/src/app/(email)/newsletter/_components/index.tsx",
    "apps/web/src/app/(email)/newsletter/page.tsx",
    "apps/web/src/app/_components/boot-promo.tsx",
    "apps/web/src/app/_components/hero.tsx",
    "apps/web/src/app/challenge/[slug]/aot-slugs.ts",
    "apps/web/src/app/challenge/[slug]/page.tsx",
    "apps/web/src/app/challenge/[slug]/solutions/[solutionId]/page.tsx",
    "apps/web/src/app/challenge/[slug]/solutions/page.tsx",
    "apps/web/src/app/challenge/[slug]/submissions/[[...catchAll]]/_components/overview.tsx",
    "apps/web/src/app/challenge/[slug]/submissions/[[...catchAll]]/page.tsx",
    "apps/web/src/app/explore/[slug]/page.tsx",
    "apps/web/src/app/explore/page.tsx",
    "apps/web/src/app/not-found.tsx",
    "apps/web/src/app/notifications/page.tsx",
    "apps/web/src/app/share/page.tsx",
    "apps/web/src/app/support/page.tsx",
    "apps/web/src/app/tracks/[slug]/page.tsx",
    "apps/web/src/components/cookie-banner.tsx",
    "apps/web/src/components/search/use-recent-searches-storage.tsx",
    "challenges/aot/2023/10/metadata.json",
    "challenges/aot/2023/11/metadata.json",
    "challenges/aot/2023/12/metadata.json",
    "challenges/aot/2023/13/metadata.json",
    "challenges/aot/2023/14/metadata.json",
    "challenges/aot/2023/15/metadata.json",
    "challenges/aot/2023/16/metadata.json",
    "challenges/aot/2023/17/metadata.json",
    "challenges/aot/2023/18/metadata.json",
    "challenges/aot/2023/19/metadata.json",
    "challenges/aot/2023/1/metadata.json",
    "challenges/aot/2023/20/metadata.json",
    "challenges/aot/2023/20/prompt.md",
    "challenges/aot/2023/21/metadata.json",
    "challenges/aot/2023/22/metadata.json",
    "challenges/aot/2023/23/metadata.json",
    "challenges/aot/2023/24/metadata.json",
    "challenges/aot/2023/25/metadata.json",
    "challenges/aot/2023/2/metadata.json",
    "challenges/aot/2023/3/metadata.json",
    "challenges/aot/2023/4/metadata.json",
    "challenges/aot/2023/5/metadata.json",
    "challenges/aot/2023/6/metadata.json",
    "challenges/aot/2023/7/metadata.json",
    "challenges/aot/2023/8/metadata.json",
    "challenges/aot/2023/9/metadata.json",
    "challenges/aot/2024/10/metadata.json",
    "challenges/aot/2024/11/metadata.json",
    "challenges/aot/2024/12/metadata.json",
    "challenges/aot/2024/13/metadata.json",
    "challenges/aot/2024/14/metadata.json",
    "challenges/aot/2024/15/metadata.json",
    "challenges/aot/2024/16/metadata.json",
    "challenges/aot/2024/17/metadata.json",
    "challenges/aot/2024/18/metadata.json",
    "challenges/aot/2024/19/metadata.json",
    "challenges/aot/2024/1/metadata.json",
    "challenges/aot/2024/20/metadata.json",
    "challenges/aot/2024/20/prompt.md",
    "challenges/aot/2024/21/metadata.json",
    "challenges/aot/2024/22/metadata.json",
    "challenges/aot/2024/23/metadata.json",
    "challenges/aot/2024/24/metadata.json",
    "challenges/aot/2024/25/metadata.json",
    "challenges/aot/2024/2/metadata.json",
    "challenges/aot/2024/3/metadata.json",
    "challenges/aot/2024/4/metadata.json",
    "challenges/aot/2024/5/metadata.json",
    "challenges/aot/2024/6/metadata.json",
    "challenges/aot/2024/7/metadata.json",
    "challenges/aot/2024/8/metadata.json",
    "challenges/aot/2024/9/metadata.json",
    "challenges/challenge-guidelines.md",
    "challenges/type-aliases/prompt.md",
    "challenges/typeof/prompt.md",
    "context.txt",
    "docker-compose.yaml",
    "docs/procedures/000-run-e2e-tests.md",
    "package.json",
    "packages/db/seed/prod.ts",
    "packages/db/temp/algolia-ingest.ts",
    "packages/db/temp/populate-aot-challenges.ts",
    "packages/monaco/src/split-editor.tsx",
    "tooling/scripts/contributors.ts"
]

for file_path in files_to_process:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    new_content = content
    for pattern, replacement in replacements.items():
        new_content = re.sub(pattern, replacement, new_content)
    
    # Special case for package.json
    if file_path == 'package.json':
        new_content = re.sub(r'"name": "typehero"', r'"name": "leetcot"', new_content)

    # Special case for docker-compose.yaml
    if file_path == 'docker-compose.yaml':
        new_content = new_content.replace('name: typehero', 'name: leetcot')
        new_content = new_content.replace('typehero-db', 'leetcot-db')
        new_content = new_content.replace('typehero-redis', 'leetcot-redis')
        new_content = new_content.replace('typehero-data', 'leetcot-data')
        new_content = new_content.replace('image: mysql', 'image: mysql') # keep as is
        new_content = new_content.replace('MYSQL_DATABASE: typehero', 'MYSQL_DATABASE: leetcot')

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")
    else:
        print(f"No changes: {file_path}")
