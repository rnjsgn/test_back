var express = require('express');
var router = express.Router();

const db = require('../db/db');

router.post('/test', async function(req, res, next) {
  try {
    console.log('여기옴')
    await db.insertData('test', req.body);  // 데이터 삽입 완료 후 응답 처리
    res.status(200).send('Data inserted successfully');
  } catch (error) {
    res.status(500).send('Failed to insert data');
    console.error(error);
  }
});

router.get('/test2', async function(req, res, next) {
  try {
    console.log('여기옴222')
    const data = await db.findData('test')
    res.status(200).send({
      data
    })
  } catch (error) {
    res.status(500).send('Faild to findData');
    console.log(error)
  }
})

module.exports = router;
