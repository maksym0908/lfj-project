const { Router } = require('express')
const clientRouter = Router()
const config = require('config')
const firebase = require('firebase')
const db = firebase.database()
const fireStoreRef =  firebase.firestore()
const vacanciesRef = db.ref('vacancies')  
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const Vacancy = require('../models/vacancy')

  
clientRouter.post('/client/create', async (req, res) => {
    let now = new Date().toLocaleDateString()
    let newVacancyRef = db.ref(`vacancies/`).push()
    let id = newVacancyRef.key
    let vacancy = new Vacancy(req.body, now, id)
    try {
        function addNewVacancy() {
            newVacancyRef.set({...vacancy})
        } 
        await addNewVacancy() 
        res.status(201).json({ vacancy })
        console.log('Вакансия: ', req.body.position, 'успешно добавлена')
    } catch (error) {
            res.status(500).json({ message: "Error adding document: ", error})
    }
 
})

clientRouter.put('/client/vacancies/:id', (req, res) => {

    let vacancy = vacancies.find(vac => vac.id == req.params.id)
    vacancy.position = req.body.position || vacancy.position 
    vacancy.email = req.body.email || vacancy.email
    vacancy.phone = req.body.phone || vacancy.phone
    vacancy.description = req.body.description || vacancy.description
    

        let vacancyData = {
          position: req.body.position, 
          email: req.body.email,
          phone: req.body.phone,
          description: req.body.description 
        };
       
        
        let newVacancyKey = vacanciesRef.child(`/${req.body.id}/`) 
        res.json({vacancy})
        return newVacancyKey.update(vacancyData);
})

clientRouter.delete('/client/vacancies/:id', (req, res) => {

    res.send(req.params.id) 
    let deleteVacancyRef = db.ref(`vacancies/${req.params.id}`)
    deleteVacancyRef.remove()   
   .then(function() {
       console.log("Remove succeeded.")
     })  
     .catch(function(error) { 
       console.log("Remove failed: " + error.message)
     }); 
       
}) 

clientRouter.post('/client/login', [
    check('login', 'Введите корректный email').normalizeEmail().isEmail(), 
    check('password', 'Введите пароль').exists()
] , async (req, res) => {  
    const errors = validationResult(req)
    const { login, password } = await req.body
    if (!errors.isEmpty()) {
        return res.status(400).json(
            {message: errors.array()[0].msg}
    )
    } else {
        let arr = []
        await fireStoreRef.collection('credentials').get().then(function(querySnaphot) {
            querySnaphot.forEach( async function(doc) {
               arr.push(doc.data())
            }) 
        })  
        const user = arr.filter(u => u.login === login)
        loggedInUser = user[0]  
        const isMatchLogin = await loggedInUser.login.includes(login)
        const isMatchPassword = await bcrypt.compare(password, loggedInUser.password)
        if (!isMatchPassword || !isMatchLogin) { 
            res.status(400).json({ message: 'Неверный логин или пароль'})
          } else {
            const token = jwt.sign(
              { userID: login }, 
              "max cvs jwt" , 
              {expiresIn: '1h'}
          )
          res.json({ token, userID: login, name: loggedInUser.name, surname: loggedInUser.surname, id: loggedInUser.id, savedVacancies: loggedInUser.savedVacancies})
          }
    }

}) 

clientRouter.post('/client/save-vacancy', async (req, res) => {
    const {vacancyId, userId} = req.body
    const userRef = fireStoreRef.collection('credentials').doc(userId)
    userRef.update({
        savedVacancies: firebase.firestore.FieldValue.arrayUnion(vacancyId)
    }).then(res.json({vacancyId}))
})

clientRouter.delete('/client/remove-saved-vacancy/:vacancyId/:userId', async (req, res) => {
    const vacancyId = req.params.vacancyId
    const userId = req.params.userId
    const userRef = fireStoreRef.collection('credentials').doc(userId) 
    userRef.update({
        savedVacancies: firebase.firestore.FieldValue.arrayRemove(vacancyId)
    }).then(res.json({vacancyId}))
})
module.exports = clientRouter    