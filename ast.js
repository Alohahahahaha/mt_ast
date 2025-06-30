/*
@Author: Aloha
@Time: 2025/6/30 22:03
@ProjectName: mt_ast
@FileName: ast.py
@Software: PyCharm
*/

const vm = require('vm');
const files = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;


class MeiTua {
    constructor(file_path) {
        this.ast = parser.parse(files.readFileSync(file_path, "utf-8"));
        this.transCode = null;
        this.transFunc = null;
    }

    save_file() {
        const {code: newCode} = generator(this.ast);
        files.writeFileSync(
            './decode.js',
            newCode,
            "utf-8"
        );
    }

    kis() {
        const wrapIfStatement = (path) => {
            const node = path.node;
            if (!types.isBlockStatement(node.consequent)) {
                node.consequent = types.blockStatement([node.consequent]);
            }

            if (node.alternate) {
                if (types.isIfStatement(node.alternate)) {
                    wrapIfStatement({node: node.alternate});
                } else if (!types.isBlockStatement(node.alternate)) {
                    node.alternate = types.blockStatement([node.alternate]);
                }
            }
        };

        traverse(this.ast, {
            "ForStatement|WhileStatement|ForInStatement|ForOfStatement|DoWhileStatement"(path) {
                if (!types.isBlockStatement(path.node.body)) {
                    path.node.body = types.blockStatement([path.node.body]);
                }
            },
            IfStatement(path) {
                wrapIfStatement(path);
            }
        });
    }

    jub() {
        traverse(this.ast, {
            VariableDeclarator: (path) => {
                let {parentPath, node} = path;
                if (!types.isVariableDeclaration(parentPath.node)) return;
                let {id, init} = node;
                if (!types.isIdentifier(id)) return;
                if (!types.isFunctionExpression(init)) return;
                if (init.id === null) return;
                if (id.name !== init.id.name) return;
                let huv = generator(init).code;
                this.transCode = huv + '\n';
                try {
                    eval(this.transCode + `${id.name}(15)`)
                } catch (e) {
                    let msg = e.message;
                    let hos = msg.split(' is not')[0];
                    let kyb = path.scope.getBinding(hos).path;
                    let lpg = generator(kyb.node).code;
                    this.transCode = 'var ' + lpg + '\n' + huv + '\n';
                    eval(this.transCode);
                    kyb.remove();
                }
                this.transFunc = id.name;
                path.remove()
            }
        })
    }

    kov() {
        traverse(this.ast, {
            CallExpression: (path) => {
                let {callee, arguments: args} = path.node;
                if (!types.isIdentifier(callee)) return;
                if (callee.name !== this.transFunc) return;
                if (args.length !== 1) return;
                if (!types.isNumericLiteral(args[0])) {
                    if (!types.isConditionalExpression(args[0])) return;
                    let {test, consequent, alternate} = args[0];
                    if (!(types.isNumericLiteral(consequent) && types.isNumericLiteral(alternate))) return;
                    let ikt = types.callExpression(types.identifier(this.transFunc), [consequent]);
                    let yhd = types.callExpression(types.identifier(this.transFunc), [alternate]);
                    let hkx = types.conditionalExpression(test, ikt, yhd);
                    path.replaceWith(hkx);
                    return;
                }
                let ung = this.transCode + `${this.transFunc}(${args[0].value})`;
                let str = eval(ung);
                path.replaceWith(types.stringLiteral(str))
            }
        })
    }

    sky() {
        traverse(this.ast, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (!types.isIfStatement(alternate)) return;
                path.node.alternate = types.blockStatement([alternate]);
            }
        })
    }

    mtg(mainPath, id) {
        traverse(mainPath.node, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (path.node.isHandle) return;
                if (!types.isBinaryExpression(test)) {
                    if (!types.isUnaryExpression(test)) return;
                    let a, b, c;
                    a = test.argument;
                    b = types.binaryExpression('<=', types.identifier(id), types.numericLiteral(a.right.value));
                    c = types.ifStatement(b, types.blockStatement(consequent.body), null);
                    path.replaceWith(c);
                    return;
                }
                if (test.left.name !== id) return;
                if (types.isExpressionStatement(consequent.body[0]) && types.isLogicalExpression(consequent.body[0].expression)) {
                    let {left, operator, right} = consequent.body[0].expression;
                    if (!types.isBinaryExpression(left)) return;
                    if (operator !== '||') return;
                    test.operator = '===';
                    consequent.body[0] = types.expressionStatement(right);
                    return;
                }
                if (types.isIfStatement(consequent.body[0])) {
                    let a, b;
                    if (types.isIfStatement(alternate.body[0])) return;
                    if (types.isIfStatement(consequent.body[0].consequent.body[0])) return;
                    a = types.binaryExpression('===', types.identifier(id), types.numericLiteral(test.right.value + 1));
                    b = types.ifStatement(a, types.blockStatement(alternate.body), null);
                    b.isHandle = true;
                    path.node.alternate = types.blockStatement([b]);
                    return;
                }
                if (test.operator === '<=' && !types.isIfStatement(consequent.body[0])) {
                    let a, b, c, d, e, f, g, h, i, j, k, l;
                    if (alternate === null) {
                        f = path.parentPath;
                        if (f.node.body.length === 1) return;
                        g = f.node.body.slice(1);
                        h = types.identifier(id);
                        i = types.binaryExpression('===', h, test.right);
                        j = types.binaryExpression('===', h, types.numericLiteral(test.right.value + 1));
                        k = types.ifStatement(j, types.blockStatement(g), null);
                        k.isHandle = true;
                        l = types.ifStatement(i, consequent, types.blockStatement([k]));
                        l.isHandle = true;
                        f.replaceWith(l);
                        return;
                    }
                    a = types.identifier(id);
                    b = types.binaryExpression('===', a, test.right);
                    c = types.binaryExpression('===', a, types.numericLiteral(test.right.value + 1));
                    d = types.ifStatement(c, types.blockStatement(alternate.body), null);
                    d.isHandle = true;
                    e = types.ifStatement(b, consequent, types.blockStatement([d]));
                    e.isHandle = true;
                    path.replaceWith(e);
                    return;
                }
                if (test.operator === '>' && !types.isIfStatement(consequent.body[0])) {
                    let a, b, c, d, e, f;
                    if (types.isIfStatement(alternate.body[0])) {
                        path.node.test.operator = '===';
                        path.node.test.right.value = test.right.value + 1;
                        return;
                    }
                    a = types.identifier(id);
                    b = test.right.value;
                    c = types.binaryExpression('===', a, types.numericLiteral(b + 1));
                    d = types.binaryExpression('===', a, types.numericLiteral(b));
                    e = types.ifStatement(d, types.blockStatement(alternate.body), null);
                    e.isHandle = true;
                    f = types.ifStatement(c, consequent, types.blockStatement([e]));
                    f.isHandle = true;
                    path.replaceWith(f);
                }
            }
        }, mainPath.scope)
    }

    rix(mainPath, id, spv) {
        traverse(mainPath.node, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (!types.isBinaryExpression(test)) return;
                if (test.left.name !== id) return;
                if (test.operator !== '===') return;
                spv.push([test.right.value, consequent.body]);
                if (alternate === null) return;
                spv.push([alternate.body[0].test.right.value, alternate.body[0].consequent.body]);
            }
        }, mainPath.scope)
    }

    igr() {
        let knw = (zos, id) => {
            let mga, hms = [];
            if (zos.length >= 2) {
                zos.forEach(r => {
                    let f = types.switchCase(types.numericLiteral(r[0]), r[1]);
                    !(types.isBreakStatement(f.consequent.at(-1)) || types.isReturnStatement(f.consequent.at(-1))) ? f.consequent.push(types.breakStatement()) : 0;
                    hms.push(f)
                });
                mga = types.switchStatement(types.identifier(id), hms);
                return mga
            }
        };
        traverse(this.ast, {
            IfStatement: (path) => {
                let {test, consequent, alternate} = path.node;
                if (!types.isIdentifier(test)) return;
                if (!types.isForStatement(consequent.body[0])) return;
                if (alternate !== null) return;
                let byd = path.get('consequent.body.0.body.body.2');
                let oyd = consequent.body[0].body.body[0].declarations[0].id.name;
                let uyd = [];
                this.mtg(byd, oyd);
                this.rix(byd, oyd, uyd);
                uyd.sort((a, b) => a[0] - b[0]);
                let seen = new Set();
                let mie = uyd.filter(item => {
                    if (seen.has(item[0])) return false;
                    seen.add(item[0]);
                    return true;
                });
                let juc = knw(mie, oyd);
                byd.replaceWith(juc)
            }
        })
    }

    start() {
        this.kis();
        this.jub();
        this.kov();
        this.sky();
        this.igr();
        this.save_file();
    }

}

console.time('处理完毕，耗时');

let mt_ast = new MeiTua('./fullcode.js');
mt_ast.start();


console.timeEnd('处理完毕，耗时');

