// takes an array consists of channels or [ch, valueToPut]
// tries to immediately do an operation like poll/offer
// if succeeds and priority is false - return the first one
// if succeeds and priority is true and multiple results ready - return in order
// if no operations ready
// if default value provided - return it
// if no default value - wait for operations, return first one to succeed
