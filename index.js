#!/usr/bin/env node

/*
 #  Project: your-awesome-project                                              #
 #  File: \index.js                                                            #
 #                                                                             #
 #  Author: Sylvain (contact@cashsystemes.eu)                                  #
 #  Modified By: Sylvain (contact@cashsystemes.eu>)                            #
 #                                                                             #
 #  File Created: Friday, 26th July 2019 11:58:02 am                           #
 #  Last Modified: Friday, 26th July 2019 4:21:28 pm                           #
 #                                                                             #
 #  Copyright 2018 - 2019, Cash Systemes Industries                            #
 */

const inquirer = require('inquirer');
const ncp = require('ncp').ncp;
const globby = require('globby');
const fs = require('fs');
const path = require('path');



let Answers, paths
let nom = "\$service-name\$"
let regex = /\$service-name\$/g
/**
 * 
 * Stages
 */
inquirer
    .prompt([{
        name: 'name',
        message: 'Nom du micro-service ?  service-'
    }, ])
    .then(async answers => {
        Answers = answers;
        await copy_folders()
        paths = await get_paths()
        await modify_into_files(paths)
        paths = await get_paths()
        await prune(paths)

    }).catch(err => console.error)






/**
 * 
 * Methodes
 */

//  Copy l'integralité du dossier template
let copy_folders = async () => {
    return new Promise((resolve, reject) => {
        console.log(__dirname)
        ncp(__dirname+'/template', './service-' + Answers.name, err => {
            if (err) reject(err)
            resolve()
        });
    })
}

// Recupère le path de tout les fichiers
let get_paths = async () => {
    return await globby('./service-' + Answers.name, {
        expandDirectories: {
            files: ['*']
        }
    });
}

// Parcours tout les fichier a la recherche tu regex
let modify_into_files = async paths => {
    return new Promise((resolve, reject) => {

        for (const p of paths) {
            fs.readFile("./" + p, 'utf8', (err, data) => {
                if (err) reject(err)

                let fileName = path.basename("./" + p)
                let dirName = path.dirname("./" + p)


                // Recherche/replace dans le fichier
                let result = data.replace(regex, Answers.name);

                // Analyse du folder
                if (dirName.includes(nom)) {
                    dirName = dirName.replace(nom, Answers.name)

                    if (!fs.existsSync(dirName)) {
                        fs.mkdirSync(dirName);
                    }
                }


                // Analyse du nom du fichier
                if (fileName.includes(nom)) {
                    // Suppression de l'ancien fichier
                    fs.unlinkSync(path.join(dirName, fileName))
                    // Modif du nom
                    fileName = fileName.replace(regex, Answers.name)
                }

                // Ecriture du nouveau fichier
                fs.writeFile(path.join(dirName, fileName), result, 'utf8', err => {
                    if (err) reject(err)
                });

            });
        }
        resolve()
    })
}



// Supprime tout les dossiers inutiles
let prune = async (paths) => {
    return new Promise((resolve, reject) => {
        for (const p of paths) {
            let dirName = path.dirname("./" + p)

            // Analyse du folder
            if (dirName.includes(nom)) {
                deleteFolderRecursive(dirName)
            }
        }
        resolve()
    })
}


// Outil de suppression de dossier non vide
let deleteFolderRecursive = path => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};