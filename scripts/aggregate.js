const { database } = require('../nodeUtils/database')

async function main() {
  try {
    const finishedQuizSets = await database(
      `quizSets.json?orderBy="status"&equalTo="finished"`
    )

    const allQuizSets = await database(`quizSets.json?shallow=true`)

    console.log('Number of quiz created', Object.keys(finishedQuizSets).length)
    console.log('Number of quiz finished', Object.keys(allQuizSets).length)
  } catch (error) {
    console.log(error)
  }
}

main()
