import keyword_extractor from "keyword-extractor";
import React from "react";

type Props = {
  answer: string;
  setBlankAnswer: React.Dispatch<React.SetStateAction<string>>;
};

const blank = "_____";

const BlankAnswerInput = ({ answer, setBlankAnswer }: Props) => {
  const [inputValues, setInputValues] = React.useState<string[]>([]);
  const [isValid, setIsValid] = React.useState(false);

  const keywords = React.useMemo(() => {
    const words = keyword_extractor.extract(answer, {
      language: "english",
      remove_digits: true,
      return_changed_case: false,
      remove_duplicates: false,
    });
    // mix the keywords and pick 2
    const shuffled = words.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [answer]);

  const answerWithBlanks = React.useMemo(() => {
    return keywords.reduce((acc, curr) => {
      return acc.replaceAll(curr, blank);
    }, answer);
  }, [answer, keywords]);

  React.useEffect(() => {
    // Initialize input values array with empty strings
    setInputValues(new Array(keywords.length).fill(""));
  }, [keywords]);

  React.useEffect(() => {
    // Only set the blank answer if all inputs are filled
    const allFilled = inputValues.every(value => value.trim() !== "");
    setIsValid(allFilled);
    
    if (allFilled) {
      let filledAnswer = answerWithBlanks;
      inputValues.forEach((value) => {
        filledAnswer = filledAnswer.replace(blank, value.trim());
      });
      setBlankAnswer(filledAnswer);
    } else {
      setBlankAnswer("");
    }
  }, [answerWithBlanks, inputValues, setBlankAnswer]);

  const handleInputChange = (index: number, value: string) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  return (
    <div className="flex flex-col gap-4 w-full mt-4">
      <h1 className="text-xl font-semibold">
        {/* replace the blanks with input elements */}
        {answerWithBlanks.split(blank).map((part, index) => {
          return (
            <React.Fragment key={index}>
              {part}
              {index === answerWithBlanks.split(blank).length - 1 ? (
                ""
              ) : (
                <input
                  id="user-blank-input"
                  className="text-center border-b-2 border-black dark:border-white w-28 focus:border-2 focus:border-b-4 focus:outline-hidden"
                  type="text"
                  value={inputValues[index] || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  required
                />
              )}
            </React.Fragment>
          );
        })}
      </h1>
      {!isValid && (
        <p className="text-sm text-red-500">
          Please fill in all the blanks before submitting
        </p>
      )}
    </div>
  );
};

export default BlankAnswerInput;