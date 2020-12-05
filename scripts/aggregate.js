const { database } = require('../nodeUtils/database')

async function main() {
  try {
    const finishedQuizSets = await database(
      `quizSets.json?orderBy="status"&equalTo="finished"`
    )

    const unfinishedQuizSets = await database(
      `quizSets.json?orderBy="status"&equalTo="new"`
    )

    console.log('Number of quiz created', Object.keys(finishedQuizSets).length)
    console.log(
      'Number of quiz finished',
      Object.keys(unfinishedQuizSets).length
    )
  } catch (error) {
    console.log(error)
  }
}

main()
