import express from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import cors from 'cors';
const port = process.env.PORT || 8080;

const client = new OpenAI({
  apiKey: process.env.API_OPEN , // This is also the default, can be omitted
});

// Create a new Express application 
const app = express();

// Enable CORS so that your API is accessible from the browser
app.use(cors());

app.use(express.json());

// Set up a route to interact with the OpenAI API
app.post('/generate-class', async (req, res) => {

  const prompt = `return a list of ten silides for teaching  this topic "${req.body.class}", with complete descriptions no larger that 30 words fot ppt slides, return the response latin spanish`

  const schema = {
    "type": "object",
    "properties": {
      "slides": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "examples": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": ["title", "description", "image"]
        }
      }
    },
    "required": ["slides"]
  }

  client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", "content": "You are a helpful recipe assistant." },
      { role: "user", content: prompt }],
    functions: [{ name: "set_recipe", parameters: schema }],
    function_call: { name: "set_recipe" }

  }).then((completion) => {
    // Note the updated location for the response
    const response = completion.choices[0].message.function_call.arguments

    res.send(JSON.parse(response))
  })
    .catch((error) => {
      console.log(error);
    });
});


app.post('/generate-quiz', async (req, res) => {

  const prompt = `return a list of ten questions multiple option of  this topic "${req.body.class}", and the correct correct_option, return the response latin spanish`

  const schema = {
    "type": "object",
    "properties": {
      "questions": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "question": {
              "type": "string"
            },
            "options": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "correct_option": {
              "type": "string"
            },
          },
        
        "required": ["question", "options", "correct"]
      }
    }
  },
  "required": ["slides"]
}

  client.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", "content": "You are a helpful recipe assistant." },
    { role: "user", content: prompt }],
  functions: [{ name: "set_recipe", parameters: schema }],
  function_call: { name: "set_recipe" }

}).then((completion) => {
  // Note the updated location for the response
  const response = completion.choices[0].message.function_call.arguments

  res.send(JSON.parse(response))
})
    .catch((error) => {
      console.log(error);
    });
});

// Set up a route to interact with the OpenAI API
app.post('/generate-class-v2', async (req, res) => {

  const response_f = {
    data: { slides: [] },
    images: {}
  }

  const prompt = `return a list of ten silides for teaching  this topic "${req.body.class}", with complete descriptions no larger that 30 words fot ppt slides, return the response latin spanish`

  const schema = {
    "type": "object",
    "properties": {
      "slides": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "examples": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          },
          "required": ["title", "description", "image"]
        }
      }
    },
    "required": ["slides"]
  }

  client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", "content": "You are a helpful recipe assistant." },
      { role: "user", content: prompt }],
    functions: [{ name: "set_recipe", parameters: schema }],
    function_call: { name: "set_recipe" }

  }).then((completion) => {
    // Note the updated location for the response
    const response = completion.choices[0].message.function_call.arguments

    response_f.data = JSON.parse(response)

    const promises = response_f.data.slides.map(async (slide) => {
      const response = await client.images.generate({ prompt: slide.title + "in a cartoon " });
      response_f.images[slide.title] = response
    }
    )

    Promise.all(promises).then(() => {
      res.send(response_f)
    }
    )

  }).catch((error) => {
    console.log(error);
  });


})







app.post('/generate-class-dummy', async (req, res) => {

  const response = {
    "slides": [
      {
        "title": "Importancia de la biodiversidad",
        "description": "Hoy, en tu camino a la escuela, habrás observado a algún pájaro buscar comida o a un chapulín saltar entre las plantas de la milpa; tal vez descubriste que algunas flores de tu localidad ya se convirtieron en frutos, o que ya pasó el tiempo de la cosecha o está por comenzar. Los animales, las plantas y las personas formamos parte de los ecosistemas y nos relacionamos de diversas formas: algunos animales comen plantas o a otros animales, nosotros aprovechamos a las plantas y a los animales para comer, pero también para fabricar objetos que usamos en la vida diaria. En México contamos con una diversidad de climas, desde los más secos a los húmedos e incluso climas fríos; también existen paisajes diversos con montañas, valles, ríos y lagos; estas condiciones permiten la existencia de diversos ecosistemas que albergan a su vez a una variedad de plantas, animales, hongos y otros tipos de organismos. Todo lo anterior conforma la biodiversidad de México. De aquí en adelante conoceremos la importancia de la biodiversidad y el valor que tiene la riqueza natural y cultural que nos rodea.",
        "examples": []
      },
      {
        "title": "Percepción de la vida",
        "description": "Todos podemos percibir la vida en nosotros y en el resto de los organismos que habitan el planeta porque es una característica que compartimos, lo que nos permite valorarla. Adicionalmente, conocer la diversidad de características climáticas, geográficas, de animales, plantas y otros seres vivos, y reconocer que cada uno cumple una función en el ecosistema, nos permite apreciar mejor su importancia.",
        "examples": []
      },
      {
        "title": "La milpa y su importancia",
        "description": "En la milpa se siembra la calabaza; esta planta crece al nivel del suelo y evita que crezcan hierbas competidoras del maíz; además, al crecer así y hacer sombra, también conserva la humedad del suelo, lo cual promueve el crecimiento tanto del maíz como de otros elementos de la milpa, el chile o el frijol. Cuando adquirimos conciencia de la importancia de cada especie, comenzamos a descubrir el valor ecológico de la biodiversidad para nuestro país y para el planeta entero.",
        "examples": []
      },
      {
        "title": "Niveles de la biodiversidad",
        "description": "Biodiversidad genética: entre individuos de una misma especie, existen diferencias.\nBiodiversidad de especies: resultado de la variedad de especies, perceptible en cualquier paisaje.\nBiodiversidad de ecosistemas: relación entre los lugares habitados por distintas especies, considerando elementos del ambiente como el suelo, el clima o el relieve.",
        "examples": []
      },
      {
        "title": "Localización de México y su diversidad",
        "description": "México se sitúa en el continente americano, en dos zonas térmicas: la tropical en el sur y la templada en el norte. Presenta un relieve diverso con montañas, valles, mesetas, llanuras y volcanes, lo cual propicia gran diversidad de climas. Su diversidad geográfica y las aguas oceánicas que lo rodean hacen de México un país diverso en climas y paisajes, lo que favorece la biodiversidad.",
        "examples": []
      },
      {
        "title": "Especies de corales en México",
        "description": "En México se pueden encontrar más de 60 especies de corales, alrededor de una décima parte de todas las que existen en el mundo. Los corales de los mares mexicanos forman arrecifes a lo largo de las costas, especialmente en el golfo de México y el mar Caribe.",
        "examples": []
      }
    ]
  }

  res.send(response)

});






// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
