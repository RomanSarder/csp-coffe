export function raceToSuccess(promises: Promise<any>[]) {
    return Promise.all(
        promises.map((p) => {
            return p.then(
                (val) => Promise.reject(val),
                (err) => Promise.resolve(err),
            );
        }),
    ).then(
        // If '.all' resolved, we've just got an array of errors.
        (errors) => {
            return Promise.reject(errors[0]);
        },
        // If '.all' rejected, we've got the result we wanted.
        (val) => Promise.resolve(val),
    );
}
