import * as fs from 'fs'
import * as path from 'path'

/**
 * 从路径种找到某级目录的部分
 * @param p 路径
 * @param folderName 文件夹名称 
 * @param level 返回的层级偏移，正数向右，负数向左
 * @returns 返回规范化后的路径
 * @example
 * findParentFolderPath('/a/b/c/d', 'b') // prints '/a/b'
 * findParentFolderPath('/a/b/c/d', 'b', 1) // prints '/a/b/c'
 * findParentFolderPath('/a/b/c/d', 'b', -1) // prints '/a'
 */
export function findParentFolderPath(p: string, folderName: string, level = 0) {
    const splits = path.normalize(p).split(path.sep)
    const index = splits.lastIndexOf(folderName)
    if (index < 0) {
        throw new Error(`无法找到${folderName}在${p}`)
    }
    return splits.slice(0, index + level + 1).join(path.sep)
}

export function findPackageJsonSync<T>(basePath = __dirname): T {
    const packageFullPath = findParentFolderPath(basePath, 'packages', 1)
    const packageJsonPath = path.resolve(packageFullPath, 'package.json')
    return readJsonSync(packageJsonPath)
}

export function readJsonSync<T>(packageJsonPath: string): T {
    const buffer = fs.readFileSync(packageJsonPath)
    return JSON.parse(buffer.toString('utf8'))
}
