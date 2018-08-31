const path = require("path")
const chalk = require("chalk")
const cosmiconfig = require("cosmiconfig")
const { validate } = require("jest-validate")
const { replacePathSepForRegex } = require("jest-regex-util")

const NODE_MODULES = replacePathSepForRegex(
  path.sep + "node_modules" + path.sep
)

export function replaceRootDir(conf, rootDir) {
  const replace = s => s.replace("<rootDir>", rootDir)
  ;["srcPathDirs", "srcPathIgnorePatterns", "localeDir"].forEach(key => {
    const value = conf[key]

    if (!value) {
    } else if (typeof value === "string") {
      conf[key] = replace(value)
    } else if (value.length) {
      conf[key] = value.map(replace)
    }
  })

  conf.rootDir = rootDir
  return conf
}

export const defaultConfig = {
  compileNamespace: "cjs",
  extractBabelOptions: {
    plugins: [],
    presets: []
  },
  fallbackLocale: "",
  format: "lingui",
  localeDir: "<rootDir>/locale",
  locales: [],
  rootDir: "",
  sourceLocale: "",
  srcPathDirs: ["<rootDir>"],
  srcPathIgnorePatterns: [NODE_MODULES]
}

const exampleConfig = {
  ...defaultConfig,
  extractBabelOptions: {
    plugins: ["plugin"],
    presets: ["preset"]
  }
}

const deprecatedConfig = {
  fallbackLanguage: config =>
    ` Option ${chalk.bold("fallbackLanguage")} was replaced by ${chalk.bold(
      "fallbackLocale"
    )}
    
    @lingui/cli now treats your current configuration as:
    {
      ${chalk.bold('"fallbackLocale"')}: ${chalk.bold(
      `"${config.fallbackLanguage}"`
    )}
    }
    
    Please update your configuration.
    `
}

const configValidation = {
  exampleConfig,
  deprecatedConfig,
  comment: "See https://lingui.js.org/ref/conf.html for a list of valid options"
}

export function getConfig({ cwd } = {}) {
  const defaultRootDir = cwd || process.cwd()
  const configExplorer = cosmiconfig("lingui")
  const result = configExplorer.searchSync(defaultRootDir)
  const raw = { ...defaultConfig, ...(result ? result.config : {}) }

  validate(raw, configValidation)
  // Use deprecated fallbackLanguage, if defined
  raw.fallbackLocale = raw.fallbackLocale || raw.fallbackLanguage || ""

  // rootDir is either taken from config, or directory with config and finally cwd
  const rootDir =
    raw.rootDir || (result ? path.dirname(result.filepath) : defaultRootDir)
  return replaceRootDir(raw, rootDir)
}
