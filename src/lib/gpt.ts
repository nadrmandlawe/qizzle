// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// interface OutputFormat {
//   [key: string]: string | string[] | OutputFormat;
// }

// export async function strict_output(
//   system_prompt: string,
//   user_prompt: string | string[],
//   output_format: OutputFormat,
//   default_category: string = "",
//   output_value_only: boolean = false,
//   model: string = "gpt-3.5-turbo",
//   temperature: number = 1,
//   num_tries: number = 3,
//   verbose: boolean = false
// ): Promise<
//   {
//     question: string;
//     answer: string;
//   }[]
// > {
//   // if the user input is in a list, we also process the output as a list of json
//   const list_input: boolean = Array.isArray(user_prompt);
//   // if the output format contains dynamic elements of < or >, then add to the prompt to handle dynamic elements
//   const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
//   // if the output format contains list elements of [ or ], then we add to the prompt to handle lists
//   const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

//   // start off with no error message
//   let error_msg: string = "";

//   for (let i = 0; i < num_tries; i++) {
//     let output_format_prompt: string = `\nYou are to output the following in json format: ${JSON.stringify(
//       output_format
//     )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

//     if (list_output) {
//       output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
//     }

//     // if output_format contains dynamic elements, process it accordingly
//     if (dynamic_elements) {
//       output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
//     }

//     // if input is in a list format, ask it to generate json in a list
//     if (list_input) {
//       output_format_prompt += `\nGenerate a list of json, one json for each input element.`;
//     }

//     // Use OpenAI to get a response
//     const response = await openai.chat.completions.create({
//       temperature: temperature,
//       model: model,
//       messages: [
//         {
//           role: "system",
//           content: system_prompt + output_format_prompt + error_msg,
//         },
//         { role: "user", content: user_prompt.toString() },
//       ],
//     });

//     let res: string =
//       response.choices[0].message?.content?.replace(/'/g, '"') ?? "";

//     // ensure that we don't replace away apostrophes in text
//     res = res.replace(/(\w)"(\w)/g, "$1'$2");

//     if (verbose) {
//       console.log(
//         "System prompt:",
//         system_prompt + output_format_prompt + error_msg
//       );
//       console.log("\nUser prompt:", user_prompt);
//       console.log("\nGPT response:", res);
//     }

//     // try-catch block to ensure output format is adhered to
//     try {
//       let output: any = JSON.parse(res);

//       if (list_input) {
//         if (!Array.isArray(output)) {
//           throw new Error("Output format not in a list of json");
//         }
//       } else {
//         output = [output];
//       }

//       // check for each element in the output_list, the format is correctly adhered to
//       for (let index = 0; index < output.length; index++) {
//         for (const key in output_format) {
//           // unable to ensure accuracy of dynamic output header, so skip it
//           if (/<.*?>/.test(key)) {
//             continue;
//           }

//           // if output field missing, raise an error
//           if (!(key in output[index])) {
//             throw new Error(`${key} not in json output`);
//           }

//           // check that one of the choices given for the list of words is an unknown
//           if (Array.isArray(output_format[key])) {
//             const choices = output_format[key] as string[];
//             // ensure output is not a list
//             if (Array.isArray(output[index][key])) {
//               output[index][key] = output[index][key][0];
//             }
//             // output the default category (if any) if GPT is unable to identify the category
//             if (!choices.includes(output[index][key]) && default_category) {
//               output[index][key] = default_category;
//             }
//             // if the output is a description format, get only the label
//             if (output[index][key].includes(":")) {
//               output[index][key] = output[index][key].split(":")[0];
//             }
//           }
//         }

//         // if we just want the values for the outputs
//         if (output_value_only) {
//           output[index] = Object.values(output[index]);
//           // just output without the list if there is only one element
//           if (output[index].length === 1) {
//             output[index] = output[index][0];
//           }
//         }
//       }

//       return list_input ? output : output[0];
//     } catch (e) {
//       error_msg = `\n\nResult: ${res}\n\nError message: ${e}`;
//       console.log("An exception occurred:", e);
//       console.log("Current invalid json format:", res);
//     }
//   }

//   return [];
// }

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

function parseGeminiResponse(res: string) {
  // Remove any markdown formatting
  res = res.replace(/```json\n?|```\n?/g, '');
  
  // Try to parse as a single JSON array first
  try {
    return JSON.parse(res);
  } catch (e) {
    // If that fails, try to parse as multiple JSON objects
    try {
      // Split by newlines and filter out empty lines
      const jsonStrings = res.split('\n').filter(line => line.trim());
      
      // Parse each JSON object separately and combine into an array
      const jsonObjects = jsonStrings
        .filter(str => str.trim().startsWith('{') && str.trim().endsWith('}'))
        .map(str => JSON.parse(str.trim()));
      
      if (jsonObjects.length > 0) {
        return jsonObjects;
      }
    } catch (e2) {
      console.error("Failed to parse individual JSON objects:", e2);
    }
  }
  throw new Error("Failed to parse response as JSON");
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model_version: string = "gemini-1.5-flash",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<
  {
    question: string;
    answer: string;
  }[]
> {
  const list_input = Array.isArray(user_prompt);
  const dynamic_elements = /<.*?>/.test(JSON.stringify(output_format));
  const list_output = /\[.*?\]/.test(JSON.stringify(output_format));

  let error_msg = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt = `\nYou are to output the following in json format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields. Return the response as a valid JSON array.`;

    // Extract difficulty level from user prompt if it exists
    const difficultyMatch = user_prompt.toString().match(/random (basic and simple|moderately challenging|very challenging and complex)/);
    const difficultyLevel = difficultyMatch ? difficultyMatch[1] : 'moderately challenging';

    // Add difficulty-specific instructions to system prompt
    const difficultyPrompt = `\nYou are an expert quiz generator specializing in creating ${difficultyLevel} questions.
    For basic and simple questions: Focus on fundamental concepts and straightforward answers.
    For moderately challenging questions: Include some complexity and require deeper understanding.
    For very challenging questions: Test advanced knowledge and critical thinking skills.
    Current difficulty level: ${difficultyLevel}.\n`;

    system_prompt = difficultyPrompt + system_prompt;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate a list of json, one json for each input element. Wrap all responses in a JSON array using square brackets [].`;
    }

    const prompt = system_prompt + output_format_prompt + error_msg + "\n" + user_prompt.toString();

    try {
      const response = await model.generateContent([prompt]);
      let res = response.response.text();

      if (verbose) {
        console.log("System prompt:", system_prompt + output_format_prompt + error_msg);
        console.log("\nUser prompt:", user_prompt);
        console.log("\nGemini response:", res);
      }

      try {
        let output = parseGeminiResponse(res);

        if (list_input) {
          if (!Array.isArray(output)) {
            output = [output];
          }
        } else {
          output = [output];
        }

        for (let index = 0; index < output.length; index++) {
          for (const key in output_format) {
            if (/<.*?>/.test(key)) continue;

            if (!(key in output[index])) {
              throw new Error(`${key} not in json output`);
            }

            if (Array.isArray(output_format[key])) {
              const choices = output_format[key] as string[];
              if (Array.isArray(output[index][key])) {
                output[index][key] = output[index][key][0];
              }
              if (!choices.includes(output[index][key]) && default_category) {
                output[index][key] = default_category;
              }
              if (output[index][key].includes(":")) {
                output[index][key] = output[index][key].split(":")[0];
              }
            }
          }

          if (output_value_only) {
            output[index] = Object.values(output[index]);
            if (output[index].length === 1) {
              output[index] = output[index][0];
            }
          }
        }

        return list_input ? output : output[0];
      } catch (e) {
        console.error("An error occurred while parsing JSON:", e);
        console.error("Invalid JSON format:", res);
        error_msg = `\n\nResult: ${res}\n\nError message: ${e}`;
      }
    } catch (err) {
      console.error("Error communicating with Gemini:", err);
    }
  }

  return [];
}


