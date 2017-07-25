'use strict'
const cheerio = require('cheerio');
const axios = require('axios');
const env = require('./environment.json');
const replaceall = require('replaceall');

function sanitize(data) {
    return replaceall("\t", "", replaceall("\n", "", data));
}

axios.get(env.url).then(response => {
    let $ = cheerio.load(response.data);
    let schedules = [];
    let meta = {};
    let rowNum = 0, cellNum = 0, day = "";
    $('table').each((i, elm) => {
        rowNum = 0;
        meta = {};
        //console.log(elm, $(elm));
        $(elm).children().each((i, body) => {
            $(body).children().each((j, row) => {
                cellNum = 0;
                $(row).children().each((k, cell) => {
                    let rowspan = cell.attribs.rowspan;
                    if (rowspan && rowspan > 1) {
                        day = sanitize($(cell).text());
                    }
                    if (rowNum == 0) {
                        if (cellNum > 0) {
                            meta[cellNum] = sanitize($(cell).text());
                        }
                    } else {
                        let data = sanitize($(cell).text());
                        if (data.startsWith(env.course)) {
                            schedules.push({
                                day: day,
                                time: meta[cellNum],
                                course: data
                            })
                        }
                    }
                    cellNum++;
                })
                rowNum++;
            })
        });
    })
    return schedules;
})
    .then(rows => {
        console.log(rows);
        console.log(rows.length);
    })

