var APP = {
    my_user: null,

    init: function (){
        fetch('../data/world.json')
        .then(function(response){return response.json();})
        .then(function(json){
            console.log("JSON FROM APP \n", json)
            WORLD.fromJSON(json);
            APP.onWorldLoaded();
            console.log(WORLD);
        });

        CLIENT.init()
    },
    onWorldLoaded: function(){
        console.log("World Loaded")
    }
}