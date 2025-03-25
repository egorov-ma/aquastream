/**
 * Скрипт для создания бэджа покрытия кода тестами
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пути к файлам
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
const readmePath = path.join(__dirname, '..', 'README.md');

// Цвета для бэджа в зависимости от процента покрытия
const getBadgeColor = (coverage) => {
  if (coverage >= 90) return 'brightgreen';
  if (coverage >= 80) return 'green';
  if (coverage >= 70) return 'yellowgreen';
  if (coverage >= 60) return 'yellow';
  if (coverage >= 50) return 'orange';
  return 'red';
};

// Функция для расчета процента покрытия из coverage-final.json
const calculateCoverage = (coverageData) => {
  let totalStatements = 0;
  let coveredStatements = 0;
  let totalBranches = 0;
  let coveredBranches = 0;
  let totalFunctions = 0;
  let coveredFunctions = 0;
  let totalLines = 0;
  let coveredLines = 0;

  // Обходим все файлы с отчетами
  Object.values(coverageData).forEach(file => {
    // Обрабатываем statements (операторы)
    if (file.statementMap) {
      totalStatements += Object.keys(file.statementMap).length;
      coveredStatements += Object.values(file.s).filter(v => v > 0).length;
    }

    // Обрабатываем branches (ветви)
    if (file.branchMap) {
      Object.values(file.b).forEach(branches => {
        totalBranches += branches.length;
        coveredBranches += branches.filter(v => v > 0).length;
      });
    }

    // Обрабатываем functions (функции)
    if (file.fnMap) {
      totalFunctions += Object.keys(file.fnMap).length;
      coveredFunctions += Object.values(file.f).filter(v => v > 0).length;
    }

    // Обрабатываем lines (строки)
    if (file.lineMap) {
      totalLines += Object.keys(file.lineMap).length;
      coveredLines += Object.values(file.l).filter(v => v > 0).length;
    } else if (file.s) {
      // Если lineMap отсутствует, используем statementMap как приближение
      totalLines = totalStatements;
      coveredLines = coveredStatements;
    }
  });

  // Рассчитываем проценты покрытия
  const calculatePercentage = (covered, total) => 
    total === 0 ? 0 : Math.round((covered / total) * 100);

  return {
    statements: calculatePercentage(coveredStatements, totalStatements),
    branches: calculatePercentage(coveredBranches, totalBranches),
    functions: calculatePercentage(coveredFunctions, totalFunctions),
    lines: calculatePercentage(coveredLines, totalLines)
  };
};

try {
  // Проверяем существование файла отчета о покрытии
  if (!fs.existsSync(coveragePath)) {
    console.error('Файл с отчетом о покрытии не найден. Сначала запустите тесты с флагом --coverage');
    process.exit(1);
  }

  // Читаем отчет о покрытии
  const coverageReport = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  // Рассчитываем покрытие
  const coverage = calculateCoverage(coverageReport);
  
  // Получаем проценты покрытия
  const statements = coverage.statements;
  const branches = coverage.branches;
  const functions = coverage.functions;
  const lines = coverage.lines;
  
  // Создаем бэджи для разных метрик
  const badgeStatements = `![Statements](https://img.shields.io/badge/Statements-${statements}%25-${getBadgeColor(statements)})`;
  const badgeBranches = `![Branches](https://img.shields.io/badge/Branches-${branches}%25-${getBadgeColor(branches)})`;
  const badgeFunctions = `![Functions](https://img.shields.io/badge/Functions-${functions}%25-${getBadgeColor(functions)})`;
  const badgeLines = `![Lines](https://img.shields.io/badge/Lines-${lines}%25-${getBadgeColor(lines)})`;
  
  // Формируем строку с бэджами
  const badgesMarkdown = `## Покрытие кода тестами\n\n${badgeStatements} ${badgeBranches} ${badgeFunctions} ${badgeLines}\n\n`;
  
  // Проверяем наличие файла README.md
  if (!fs.existsSync(readmePath)) {
    console.log('README.md не найден, создаем новый файл с бэджами покрытия');
    fs.writeFileSync(readmePath, badgesMarkdown);
  } else {
    // Читаем содержимое README.md
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Проверяем наличие секции с покрытием кода
    const coverageSectionRegex = /## Покрытие кода тестами\n\n.*\n\n/s;
    if (coverageSectionRegex.test(readmeContent)) {
      // Заменяем существующую секцию
      readmeContent = readmeContent.replace(coverageSectionRegex, badgesMarkdown);
    } else {
      // Добавляем новую секцию в начало файла
      readmeContent = badgesMarkdown + readmeContent;
    }
    
    // Записываем обновленное содержимое в README.md
    fs.writeFileSync(readmePath, readmeContent);
  }
  
  console.log('Бэджи покрытия кода успешно добавлены в README.md');
  console.log(`Покрытие кода: Statements: ${statements}%, Branches: ${branches}%, Functions: ${functions}%, Lines: ${lines}%`);
} catch (error) {
  console.error('Ошибка при создании бэджей покрытия:', error);
  process.exit(1);
} 