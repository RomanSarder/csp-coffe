type PromisesType<P> = P extends Promise<infer T>[] ? T : unknown;

export function raceToSuccess<P extends Promise<any>[]>(
    promises: P,
): Promise<PromisesType<P>> {
    return Promise.all(
        promises.map((promise) => {
            return promise
                .catch((e) => {
                    return Promise.resolve(e);
                })
                .then((res) => {
                    return Promise.reject(res);
                });
        }),
    ).catch((res) => {
        return Promise.resolve(res);
    }) as Promise<PromisesType<P>>;
}
