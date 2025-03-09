import { readFileSync } from 'fs'
import { Root } from 'node_modules/remark-stringify/lib'
import { join } from 'pathe'
import { cwd } from 'process'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import {unified} from 'unified'
import {visit} from 'unist-util-visit'

function myRehypePluginToIncreaseHeadings() {
    /**
     * @param {Root} tree
     */
    return function (tree: Root) {
        console.log(tree.type);
    //   visit(tree, 'element', function (node) {
        
    //     if (['h1', 'h2', 'h3', 'h4', 'h5'].includes(node.tagName)) {
    //       node.tagName = 'h' + (Number(node.tagName.charAt(1)) + 1)
    //     }
    //   })
    }
  }

const html = readFileSync(join(cwd(),"./example.github.html"), "utf-8");

const tree = unified()
  .use(rehypeParse).parse(html);

visit(tree, (node) => {
    if(node.type === "element")
    console.log(node.tagName, node.properties);
})

//   .use(myRehypePluginToIncreaseHeadings)
// //   .use(rehypeStringify)
//   .process(html)

// console.log(String(pipeline))
