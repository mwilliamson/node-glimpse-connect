glimpse.data.initMetadata({
    plugins: {
        Middleware: {
            layout: [[
                {title: "Name", data: "name"},
                {title: "Path", data: "sourcePath"},
                {title: "Line", data: "sourceLine"},
                {title: "Column", data: "sourceColumn"},
                {title: "Where was this added?", data: "useStackTrace"}
            ]]
        }
    },
    resources: {}
});
