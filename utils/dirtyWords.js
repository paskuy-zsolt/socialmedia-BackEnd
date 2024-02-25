import Filter from 'bad-words';

const filter = new Filter();

export const filterDirtyWords = (content) => {
    return filter.clean(content);
};
