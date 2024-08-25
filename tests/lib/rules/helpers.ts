export function unixPath(...path: string[]) {
  return `home/projects/src/${path.join("/")}`;
}
export function windowsPath(...path: string[]) {
  return `C:\\projects\\src\\${path.join("\\")}`;
}
