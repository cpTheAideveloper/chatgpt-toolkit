The code is located in the `helpers/streamHelpers.js` file and contains two functions:

1. `getPartialMarkerMatch`
2. `extractStartMarkerInfo`

Both functions are designed to help with processing strings (buffers) and identifying specific patterns or markers within those strings.

---

## Function 1: `getPartialMarkerMatch`

### Purpose:
This function checks how much of a given `marker` string matches the end of a `buffer` string. It returns the number of matching characters. If there's no match, it returns `0`.

### Code Breakdown:

```javascript
/**
 * Returns the number of characters at the end of `buffer` that match the given `marker`.
 * Returns 0 if no partial match is found.
 */
export const getPartialMarkerMatch = (buffer, marker) => {
  for (let i = marker.length; i > 0; i--) {
    const partial = marker.substring(0, i);
    if (buffer.endsWith(partial)) {
      return i;
    }
  }
  return 0;
};
```

### Step-by-Step Explanation:

1. **Function Declaration:**
   ```javascript
   export const getPartialMarkerMatch = (buffer, marker) => {
   ```
   - `export`: Makes the function available for use in other files.
   - `const getPartialMarkerMatch`: Defines a constant function named `getPartialMarkerMatch`.
   - `(buffer, marker) => { ... }`: This is an arrow function that takes two parameters:
     - `buffer`: A string we want to check.
     - `marker`: A string pattern we're looking for at the end of `buffer`.

2. **Loop Initialization:**
   ```javascript
   for (let i = marker.length; i > 0; i--) {
   ```
   - `for`: Starts a loop.
   - `let i = marker.length`: Initializes a variable `i` to the length of the `marker` string.
   - `i > 0`: The loop will continue as long as `i` is greater than `0`.
   - `i--`: After each iteration, decrement `i` by `1`.

3. **Extract Partial Marker:**
   ```javascript
   const partial = marker.substring(0, i);
   ```
   - `const partial`: Defines a constant named `partial`.
   - `marker.substring(0, i)`: Extracts a substring from `marker`, starting at index `0` up to (but not including) index `i`. This means it takes the first `i` characters of `marker`.

4. **Check if Buffer Ends with Partial Marker:**
   ```javascript
   if (buffer.endsWith(partial)) {
     return i;
   }
   ```
   - `buffer.endsWith(partial)`: Checks if the `buffer` string ends with the `partial` string.
   - `if`: If this condition is true (the buffer ends with the partial marker), then:
     - `return i;`: The function returns the current value of `i`, which is the number of matching characters.

5. **Return 0 if No Match Found:**
   ```javascript
   return 0;
   ```
   - If the loop completes without finding any partial match (i.e., no ending substring of `buffer` matches any part of `marker`), the function returns `0`.

### **Example:**

Let's say:
- `buffer = "HelloWorld"`
- `marker = "WorldXYZ"`

The function checks:
- Does "HelloWorld" end with "WorldXYZ"? No.
- Then, does it end with "WorldXY"? No.
- Then, "WorldX"? No.
- Then, "World"? **Yes**.

So, it returns `5` (the length of "World").

---

## Function 2: `extractStartMarkerInfo`

### Purpose:
This function looks for a complete start marker pattern within a `buffer` string. If it finds one, it extracts:
- The index where the start marker begins.
- The index of the closing bracket `]` that follows.
- The language specified between the start pattern and the closing bracket.

If it doesn't find the complete start marker, it returns `null`.

### Code Breakdown:

```javascript
/**
 * Checks if a complete start marker exists in the buffer.
 * If found, returns an object with the start index, closing bracket index, and the extracted language.
 * Otherwise returns null.
 */
export const extractStartMarkerInfo = (buffer, startPattern) => {
  const startIndex = buffer.indexOf(startPattern);
  const closingBracketIndex = buffer.indexOf("]", startIndex + startPattern.length);
  if (closingBracketIndex !== -1) {
    const language = buffer.substring(startIndex + startPattern.length, closingBracketIndex);
    return { startIndex, closingBracketIndex, language };
  }
  return null;
};
```

### Step-by-Step Explanation:

1. **Function Declaration:**
   ```javascript
   export const extractStartMarkerInfo = (buffer, startPattern) => {
   ```
   - Similar to the first function, this declares and exports a function named `extractStartMarkerInfo`.
   - Parameters:
     - `buffer`: The string to search within.
     - `startPattern`: The pattern that signifies the start marker we're looking for.

2. **Find Start Index:**
   ```javascript
   const startIndex = buffer.indexOf(startPattern);
   ```
   - `const startIndex`: Defines a constant to hold the index where `startPattern` first appears in `buffer`.
   - `buffer.indexOf(startPattern)`: Searches for the first occurrence of `startPattern` in `buffer`. Returns the position (index) or `-1` if not found.

3. **Find Closing Bracket Index:**
   ```javascript
   const closingBracketIndex = buffer.indexOf("]", startIndex + startPattern.length);
   ```
   - `const closingBracketIndex`: Defines a constant to hold the index of the closing bracket `]`.
   - `buffer.indexOf("]", startIndex + startPattern.length)`: Searches for the first `]` character in `buffer` starting **after** the end of `startPattern`.
     - `startIndex + startPattern.length`: Calculates the position right after the start pattern ends.
     - This ensures that it looks for the `]` that closes the start marker.

4. **Check if Closing Bracket is Found:**
   ```javascript
   if (closingBracketIndex !== -1) {
   ```
   - `if (closingBracketIndex !== -1)`: Checks whether a closing bracket `]` was found.
     - `indexOf` returns `-1` if the character isn't found.

5. **Extract Language:**
   ```javascript
   const language = buffer.substring(startIndex + startPattern.length, closingBracketIndex);
   ```
   - `const language`: Defines a constant to hold the substring representing the language.
   - `buffer.substring(startIndex + startPattern.length, closingBracketIndex)`: Extracts the substring between the end of `startPattern` and the closing bracket.
     - This is typically where the language is specified (e.g., specifying "javascript" in a code block).

6. **Return Information Object:**
   ```javascript
   return { startIndex, closingBracketIndex, language };
   ```
   - If a closing bracket is found, the function returns an object containing:
     - `startIndex`: Where the start marker begins.
     - `closingBracketIndex`: Where the closing bracket `]` is located.
     - `language`: The extracted language string.

7. **Return `null` if No Complete Start Marker:**
   ```javascript
   return null;
   ```
   - If there's no closing bracket found after the start pattern, the function returns `null` to indicate that a complete start marker wasn't found.

### **Example:**

Let's say:
- `buffer = "Here is some code: ```javascript] console.log('Hello World'); ```"`
- `startPattern = "```"`

The function performs the following steps:
1. Finds `startIndex`:
   - `buffer.indexOf("```")` returns the index where the first ``` starts.
2. Finds `closingBracketIndex`:
   - Searches for `]` starting after the end of ```javascript```
3. Extracts `language`:
   - `buffer.substring(startIndex + 3, closingBracketIndex)` extracts `"javascript"`.
4. Returns:
   ```javascript
   {
     startIndex: [index where "```" starts],
     closingBracketIndex: [index of "]"],
     language: "javascript"
   }
   ```
   
If the buffer doesn't contain a closing `]` after the start pattern, the function returns `null`.

---

## Summary

Both functions are utility helpers for processing strings, particularly useful when dealing with streams of data or parsing text with specific markers.

1. **`getPartialMarkerMatch`:**
   - Checks how much of a `marker` string appears at the end of a `buffer` string.
   - Useful for scenarios where you might be receiving data in chunks and need to verify if a part of a marker is present at the end, possibly indicating the start of a new segment.

2. **`extractStartMarkerInfo`:**
   - Searches for a complete start marker pattern within a `buffer` string.
   - If found, it extracts relevant information like the position of the marker and any additional data (e.g., language specification).
   - Useful for parsing structured text, such as code blocks in markdown where you specify a language for syntax highlighting.

Understanding these helper functions can be particularly beneficial when working on applications that process or transform text data, such as chat applications, markdown parsers, or code editors.