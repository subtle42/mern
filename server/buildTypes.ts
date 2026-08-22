import { readFileSync, writeFileSync } from 'fs'
import openToTs from 'openapi-typescript'
import myTypes from './swagger.json'
import * as ts from 'typescript'

export const runBuildTypes = async() => {
    const data = readFileSync('./swagger.json', 'utf-8')
    const res = await openToTs(data, {
        defaultNonNullable: false,
    })
    writeNodesToFile(res, '../client/app/myTypes.ts')

    writeFileSync('../client/app/swagger.ts', `export const swagger = ${data} as const`)

    // const myTypes =  await import('./swagger.json')
    const schemas = myTypes['components']['schemas']
    Object.keys(schemas).forEach(key => console.log(key))
    let pageData = `import {components} from './myTypes'\n`
    pageData += `import { swagger } from './swagger'\n`
    pageData += `import { JSONSchemaType } from 'ajv'\n\n`

    Object.keys(schemas).forEach(key => {
        pageData += `export type I${key} = Omit<components['schemas']['${key}'], '__v'>\n`
        pageData += `export const ${key}Schema =  swagger.components['schemas']['${key}'] as JSONSchemaType<I${key}>\n`
    })
    writeFileSync('../client/app/mySchemas.ts', pageData)
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

// runBuild()