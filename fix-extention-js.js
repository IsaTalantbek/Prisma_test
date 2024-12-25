import fs from 'fs'
import path from 'path'

// Указываем путь к директории с вашими скомпилированными файлами
const distDirectory = path.resolve(process.cwd(), 'dist')

// Функция для обработки всех файлов в директории, включая подкаталоги
async function processDirectory(directory) {
    try {
        // Получаем все файлы и папки в указанной директории
        const files = await fs.promises.readdir(directory)

        for (const file of files) {
            const filePath = path.join(directory, file)

            // Проверяем, является ли это директорией
            const stat = await fs.promises.stat(filePath)

            if (stat.isDirectory()) {
                // Если это директория, рекурсивно вызываем функцию для её обработки
                await processDirectory(filePath)
            } else if (path.extname(file) === '.js') {
                // Если это .js файл, обрабатываем его
                const data = await fs.promises.readFile(filePath, 'utf8')

                // Регулярное выражение для поиска строк импорта без расширения .js
                const updatedData = data.replace(
                    /import\s+(.*)\s+from\s+['"](.*)['"]/g,
                    (match, p1, p2) => {
                        // Условие, чтобы трогать только импорты с относительными путями (./, ../, /)
                        if (
                            (p2.startsWith('./') ||
                                p2.startsWith('../') ||
                                p2.startsWith('/')) && // относительные и абсолютные пути
                            !p2.endsWith('.js') // если путь не заканчивается на .js
                        ) {
                            const updatedImportPath = p2 + '.js'
                            return `import ${p1} from '${updatedImportPath}'`
                        }
                        // Не изменяем внешние библиотеки
                        return match
                    }
                )

                // Если данные изменились, записываем обновленный файл
                if (updatedData !== data) {
                    await fs.promises.writeFile(filePath, updatedData, 'utf8')
                    console.log(`Файл обновлен: ${filePath}`)
                }
            }
        }
    } catch (err) {
        console.error('Ошибка при обработке файлов:', err)
    }
}

// Запуск функции для добавления расширений .js к путям импортов в директории dist
processDirectory(distDirectory)
