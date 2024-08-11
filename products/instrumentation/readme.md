# @tunnel/instrumentation

In order to augment the behavior of userland code, we instrument the user's code before executing it.

For maximum performance, we want to instrument the code in a way such that V8 can easily optimize the code.

## Examples

```javascript
// multiply.js

function multiply(a, b = 1) {
  console.info(`Multiplying ${a} and ${b}...`);
  return a * b;
}

console.info("Result:", multiply(1, multiply(2, 3)));
```

The above code gets instrumented into:

```typescript
const TNL$commonJsPrimitives = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  true,
  false,
  "",
  " ",
  "\t",
  "\n",
  null,
  undefined,
];

var TNL$ = {
  /**
    Inlined information about the function (name + location)
    Format: "<functionName>@/<filepath>:<lineNumber>:<columnNumber>:<offset>"
  */
  fnMetadata: ["multiply@/multiply.js:3:1:2"],
  // An array of `UInt32Array`s representing the different traces
  // throughout the program's lifecycle
  traces: new Set<Uint32Array>(),
  valueReferenceIndices: new Map<unknown, number>(
    TNL$commonJsPrimitives.map((TNL$primitive, i) => [TNL$primitive, i])
  ),
  overloadedFunctions: new WeakSet<Function>(),
  /**
    Because `trackFunctionInvoked` might be on a "hot path" (e.g. called in a
    function like `requestAnimationFrame`, it must be performant and memory
    efficient)
  */
  trackFunctionDeclarationInvoked(
    TNL$fnMetadataIndex,
    TNL$trace,
    TNL$args,
    TNL$passedTrace
  ) {
    TNL$trace[TNL$trace[0]++] = 0;
    TNL$trace[TNL$trace[0]++] = TNL$fnMetadataIndex;
    TNL$trace[TNL$trace[0]++] = TNL$args.length;

    // We use a manual for-loop because `arguments` isn't iterable
    for (var i = TNL$passedTrace ? 1 : 0; i < TNL$args.length; i += 1) {
      var TNL$valueReferenceIndex = TNL$valueReferenceIndices.get(TNL$args[i]);
      if (TNL$valueReferenceIndex !== undefined) {
        TNL$trace[TNL$trace[0]++] = TNL$valueReferenceIndex;
      } else {
        TNL$valueReferenceIndex = TNL$valueReferenceIndices.size + 1;
        TNL$valueReferenceIndices.set(TNL$args[i], TNL$valueReferenceIndex);
        TNL$trace[TNL$trace[0]++] = TNL$valueReferenceIndex;
      }
    }
  },
  trackFunctionReturn(TNL$fnMetadataIndex, TNL$trace, TNL$ret) {
    TNL$trace[TNL$trace[0]++] = 1;
    TNL$trace[TNL$trace[0]++] = TNL$fnMetadataIndex;
    var TNL$valueReferenceIndex = TNL$valueReferenceIndices.get(TNL$ret);
    if (TNL$valueReferenceIndex !== undefined) {
      TNL$trace[TNL$trace[0]++] = TNL$valueReferenceIndex;
    } else {
      TNL$valueReferenceIndex = TNL$valueReferences.size + 1;
      TNL$valueReferenceIndices.set(TNL$ret, TNL$valueReferenceIndex);
      TNL$trace[TNL$trace[0]++] = TNL$valueReferenceIndex;
    }

    return TNL$ret;
  },
};

TNL$.overloadedFunctions.add(multiply);

/**
  The `TNL$trace` initialized from global execution.

  Possible instructions:
  - `0 <fn> <# args> <...arg indices>`
  - `1 <fn> <ret index>`

  `TNL$trace[0]` represents next available cell
*/
var TNL$trace = new Uint32Array(
  // TODO: this value should be (the maximum size of a JS stacktrace) *
  // (max # arguments passed to one function) + 1
  65536
);

// Next avaliable index is 1 since index 0 is reserved for looking
// up the next available index
TNL$trace[0] = 1;

var TNL$multiply$arg1$default;

function multiply(
  // When overloading arguments, we want to use placeholder arguments for the
  // sole purpose of preserving the function's `.length` property
  TNL$0_,
  TNL$1_
) {
  var TNL$passedTrace = TNL$traces.has(arguments[0]);
  // Copied from the original function declaration's argument identifiers
  var TNL$trace, a, b;

  if (TNL$passedTrace) {
    TNL$trace = arguments[0];
    a = arguments[1];
    b = arguments[2];
  } else {
    TNL$trace = new Uint32Array(65536);
    TNL$trace[0] = 1;
    TNL$.traces.add(TNL$trace);
    a = arguments[0];
    b = arguments[1];
  }

  // Default arguments
  if (b === undefined) {
    b = TNL$multiply$arg1$default ??= 1;
  }

  TNL$.trackFunctionInvoked(
    // The function's metadata index (of TNL$.fnMetadata)
    0,
    TNL$trace,
    arguments,
    TNL$passedTrace
  );

  /***************************/
  /* INSTRUMENTED BODY START */
  /***************************/

  // We retain a reference to the callee reference
  // It's important to only access callee reference once in case it is a Proxy
  var TNL$callee0$obj = console,
    TNL$callee0 = TNL$callee0$obj.log;
  TNL$callee0$arg0 = `Multiplying ${a} and ${b}`;

  // If our callee function is not a function, we call it so we throw a more friendly
  // "x is not a function" error instead of "x.call is not a function"
  if (typeof TNL$callee0 !== "function") TNL$callee0();

  // If our callee function has been overloaded, we can pass `TNL$trace`
  TNL$.overloadedFunctions.has(TNL$callee0)
    ? // We need to use `Function#call` in order to
      // preserve the original `this` argument
      TNL$callee0.call(TNL$callee0$obj, TNL$trace, TNL$callee0$arg0)
    : TNL$callee0.call(TNL$callee0$obj, TNL$callee0$arg0);

  // `return` statements are wrapped with `TNL$.trackFunctionReturn`
  return TNL$.trackFunctionReturn(
    0,
    TNL$trace,
    // The expression after `return`
    a * b
  );

  /***************************/
  /*  INSTRUMENTED BODY END  */
  /***************************/
}

var TNL$callee0$obj = console,
  TNL$callee0 = TNL$callee0$obj.log,
  TNL$callee0$arg0 = "Result:",
  TNL$callee1 = multiply,
  TNL$callee1$arg0 = 1,
  TNL$callee2 = multiply,
  TNL$callee2$arg0 = 2,
  TNL$callee2$arg1 = 3,
  TNL$callee1$arg2 = TNL$callee2(TNL$callee2$arg0, TNL$callee$arg1),
  TNL$callee0$arg1 = TNL$callee1(TNL$callee1$arg0, TNL$callee1$arg1);

TNL$callee0.call(TNL$callee0$obj, TNL$callee1$arg0, TNL$callee1$arg1);
```
