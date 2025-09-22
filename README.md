# Craft Web - Monorepo Structure

This repository contains two Next.js applications that share common configurations:

## Project Structure

```
craft-web/
├── user-site/          # Customer-facing e-commerce website
├── admin/              # Admin dashboard application
├── .gitignore          # Shared Git ignore rules
├── tsconfig.base.json  # Shared TypeScript configuration
├── eslint.config.base.js # Shared ESLint configuration
├── tailwind.config.base.js # Shared Tailwind CSS configuration
└── postcss.config.base.js # Shared PostCSS configuration
```

## Shared Configurations

### TypeScript Configuration
- **Base config**: `tsconfig.base.json`
- **Project configs**: Each project extends the base config with project-specific paths
- **User-site**: Uses `@/*` pointing to `./*`
- **Admin**: Uses `@/*` pointing to `./src/*`

### ESLint Configuration
- **Base config**: `eslint.config.base.js`
- **Project configs**: Each project extends the base config
- **Rules**: Consistent linting rules across both projects

### Tailwind CSS Configuration
- **Base config**: `tailwind.config.base.js`
- **Project configs**: Each project extends the base config with project-specific content paths
- **Theme**: Shared color scheme and design tokens

### PostCSS Configuration
- **Base config**: `postcss.config.base.js`
- **Project configs**: Each project uses Tailwind CSS PostCSS plugin

## Development Workflow

### Running Projects

```bash
# Run user-site
cd user-site
npm run dev

# Run admin
cd admin
npm run dev
```

### Building Projects

```bash
# Build user-site
cd user-site
npm run build

# Build admin
cd admin
npm run build
```

## Benefits of This Structure

1. **Consistent Configuration**: All projects use the same base configurations
2. **Easy Maintenance**: Update shared configs in one place
3. **Reduced Conflicts**: Shared files are managed centrally
4. **Independent Development**: Each project can be developed independently
5. **Shared Dependencies**: Common dependencies can be managed at the root level

## Adding New Projects

To add a new project:

1. Create a new directory for your project
2. Copy the base configuration files
3. Update the project-specific configurations to extend the base configs
4. Add the project to the root `.gitignore` if needed

## Git Workflow

- Each project maintains its own `package.json` and dependencies
- Shared configurations are managed at the root level
- Use feature branches for each project to avoid merge conflicts
- Merge projects independently to prevent configuration conflicts
