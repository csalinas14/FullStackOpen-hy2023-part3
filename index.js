require('dotenv').config()
const express = require('express')
const app = express()

const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('content', (request, response) => {
    
    if(request.method === 'POST'){
        console.log('works')
        return JSON.stringify(request.body)
    }
    return " "
    
}
)

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(cors())
app.use(express.static('build'))


const date = new Date()

let persons = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mar Poppendieck", 
      "number": "39-23-6423122"
    }
]

let persons_count = persons.length

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
  })

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>`)
    })
    
})

app.get('/api/persons/:id', (request, response, next) => {
    //const id = Number(request.params.id)
    //const person = persons.find(person => person.id === id)

    Person.findById(request.params.id)
        .then(person => {
            if(person){
                response.json(person)
            }
            else{
                response.status(404).end()
            }
        })
        .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
    //const id = Number(request.params.id)
    //persons = persons.filter(person => person.id !== id)

    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
    
})

app.post('/api/persons', (request, response, next) => {
    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const body = request.body
    if(!body.name || !body.number){
        return response.status(400).json({
            error: 'name or number missing'
        })
    }


    if(persons.find(p => p.name === body.name)){
        return response.status(400).json({
            error: 'name is not unique'
        })
    }

    const person = new Person({
        //id: getRandomInt(10000),
        name: body.name,
        number: body.number
    })
    

    //persons = persons.concat(person)
    console.log(person)
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
    
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  // handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
  
  // this has to be the last loaded middleware.
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

