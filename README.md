# eslint-plugin-kisszaya-fsd-plugin

Customizable plugin to format code, inspired by fsd principles

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-kisszaya-fsd-plugin`:

```sh
npm install eslint-plugin-kisszaya-fsd-plugin --save-dev
```

## Usage

Add `kisszaya-fsd-plugin` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```
{
    "plugins": [
        "kisszaya-fsd-plugin"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
      "kisszaya-fsd-plugin/fsd-relative-path": [
        "error",
        { alias: "@/", projectStructure: PROJECT_STRUCTURE },
      ],
      "kisszaya-fsd-plugin/absolute-public-api-imports": [
        "error",
        { alias: "@/", projectStructure: PROJECT_STRUCTURE },
      ],
      "kisszaya-fsd-plugin/layer-imports": [
        "error",
        { alias: "@/", projectStructure: PROJECT_STRUCTURE },
      ]
    }
}
```



## Configurations

Project structure configuration is required to understand where the index.ts files are located. 
Absolute imports will only be used within these index.ts files.

Example:
```ts
const PROJECT_STRUCTURE = {
  app: 1,
  pages: {
    "**": 1,
  },
  layouts: {
    "**": 1,
  },
  widgets: {
    "**": 1,
  },
  features: {
    "**": 1,
  },
  entities: {
    "**": 1,
  },
  shared: {
    api: 1,
    assets: {
      images: 1,
      icons: 1,
    },
    config: 1,
    consts: 1,
    init: 1,
    routing: 1,
    types: 1,
    ui: {
      "**": 1,
    },
    lib: {
      "**": 1,
    },
    viewer: 1,
  },
};
```

## Rules

**kisszaya-fsd-plugin/fsd-relative-path**:  Imports within one slice should be relative.

**kisszaya-fsd-plugin/absolute-public-api-imports**:  Absolute imports should be only from public API.

**kisszaya-fsd-plugin/layer-imports**: Modules on one layer can only interact with modules from the layers strictly below.
