import { readFileSync, writeFileSync, copyFileSync } from 'fs'
import openToTs from 'openapi-typescript'
import myTypes from './swagger.json'
import * as ts from 'typescript'

export const runBuildTypes = async() => {
    const data = readFileSync('./swagger.json', 'utf-8')
    const res = await openToTs(data, {
        defaultNonNullable: false,
    })
    writeNodesToFile(res, '../client/app/myTypes.ts')
    console.log('copying swagger...')
    copyFileSync('./swagger.json', '../client/app/swagger.json')
    console.log('done copying swagger...')

    const schemas = myTypes['components']['schemas']
    let pageData = `import {components} from './myTypes'\n`
    pageData += `import swagger from './swagger.json'\n`
    pageData += `import { ajvResolver } from '@hookform/resolvers/ajv'\n\n`

    Object.keys(schemas).forEach(key => {
        pageData += `export type I${key} = Omit<components['schemas']['${key}'], '__v'>\n`
        pageData += `export const ${key}Resolver = ajvResolver<I${key}>(swagger.components.schemas.${key} as any)\n`
    })
    console.log('writing schemas to client folder...')
    writeFileSync('../client/app/mySchemas.ts', pageData)
    console.log('done building types')
}


function writeNodesToFile(nodes, outputPath) {
    // 1. Create a dummy SourceFile to serve as the context
    const sourceFile = ts.createSourceFile(
        outputPath,
        '',
        ts.ScriptTarget.Latest,
        false,
        ts.ScriptKind.TS
    );
    
    // 2. Wrap your ts.Node[] in a ts.NodeArray
    const nodeArray = ts.factory.createNodeArray(nodes);
    
    // 3. Create a Printer
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
        removeComments: false,
    });
    
    // 4. Print the list to a string
    const fileContent = printer.printList(
        ts.ListFormat.MultiLine,
        nodeArray,
        sourceFile
    );

    let noNullContent = fileContent.replace(/ \| null/g, '')
    // noNullContent = fileContent.replace(/ \\number | null/g, '')
    
    // 5. Write to the filesystem
    writeFileSync(outputPath, fileContent, 'utf-8');
}
