import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()

function processFiles(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)

        if (fs.statSync(filePath).isDirectory()) {
            processFiles(filePath)
        } else if (filePath.endsWith('js')) {
            let content = fs.readFileSync(filePath, 'utf8')
            content = content.replace(
                /from\s+['"](.*)\.js['"]/g,
                (match, p1) => {
                    return `from '${p1}'`
                }
            )
            content = content.replace(
                /import\s+['"](.*)\.js['"]/g,
                (match, p1) => {
                    return `import '${p1}'`
                }
            )
            fs.writeFileSync(filePath, content, 'utf8')
            console.log(`Updated imports in: ${filePath}`)
        }
    }
}

const directory = path.resolve(__dirname, 'dist') // Укажите здесь выходную папку компиляции
processFiles(directory)
console.log('Import updates completed!')
