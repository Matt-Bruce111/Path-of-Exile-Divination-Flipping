var league = "";
var itemDB = [];
var divCards = [];

// Get All
function getDivCards(league){
    $.ajax({
        url: `https://poe.ninja/api/data/itemoverview?league=${league}&type=DivinationCard&language=en`,    
        method: "GET",
        success:function(response){
            data = response
            data = cleanData(data)
            for (i = 0; i < data.length; i++){
                divCards.push(data[i])
            }
            getSetValue(divCards)
            getItemFromCard()
            addPriceDataToCards()
            console.log(`Divination Cards Returned: ${divCards.length}`)
            console.log(divCards)
            buildTable(divCards)
            
    }})
}

//getLeague will call the official pathofexile league api and select the softcore league id (Currently hardcoded as response[4])
function getLeague(){
    $.ajax({
        url: "https://api.pathofexile.com/leagues?type=main&compact=1",
        method: "GET",
        async: false,
        success:function(response){
            data = response[4]
            console.log(`Current League: ${data.id}`)
            league = data.id
        }
    })
}

// Compile all the item data from poe.ninja into one large array
function buildItemDatabase(league){
    const typeTag = ["Oil", "Incubator", "Scarab", "Fossil", "Resonator", "Essence", "DivinationCard", "SkillGem", "BaseType", 
    "HelmetEnchant", "UniqueMap", "UniqueJewel", "UniqueFlask", "UniqueWeapon", "UniqueArmour", "UniqueAccessory", "Beast"]
    
    for (i = 0; i < typeTag.length; i++){
        $.ajax({
        url: `https://poe.ninja/api/data/itemoverview?league=${league}&type=${typeTag[i]}&language=en`,
        async: false,
        method: "GET",
        success:function(response){
            data = response
            data = cleanData(data)
            console.log(data)
            for (j = 0; j < data.length; j++){
                itemDB.push(data[j])
            }
        }  
    })
    }
    console.log(`Items Returned: ${itemDB.length}`)
    console.log(itemDB)
}

function getItemFromCard(){
    for (var i = 0; i < divCards.length; i++){
        var explicitString = divCards[i].explicitModifiers[0].text
        var start = explicitString.search("{");
        var end = explicitString.search("}");
        itemName = explicitString.slice(start + 1, end)
        divCards[i].itemName = itemName
    }
    console.log(itemDB)
}

function search(itemName, itemDB){
    for (let i=0; i < itemDB.length; i++) {
        if (itemDB[i].name === itemName) {
            // console.log(itemDB[i].chaosValue)
            return itemDB[i];
        }
    }
}

function addPriceDataToCards(){
    for (let i = 0; i < divCards.length; i++){
        priceData = search(divCards[i].itemName, itemDB)
        console.log(priceData)
        if (priceData === undefined){
            console.log("Couldnt find Item Value")
        } else {
            divCards[i].itemChaosValue = priceData.chaosValue
            divCards[i].itemDivValue = priceData.divineValue
        }
    }
}

// WIP For searching items such as Corrupted Mageblood
function searchItem(){
    $.ajax({
        url: "https://www.pathofexile.com/api/trade/search/Sanctum",    
        method: "POST",
        success:function(response){
            data = response
            data = cleanData(data)
            getSetValue(data)
            buildTable(data)
            console.log(data)
        }})
}

// cleanData will go thorugh the JSON recieved from the poe.ninja api and cull any of the unneeded data.
function cleanData(data){
    let newArray = data.lines.reduce((accumulator, item) => {
        let cleanData = {};
        if (item.hasOwnProperty("name")) {
            cleanData.name = item.name;
        }
        if (item.hasOwnProperty("chaosValue")) {
            cleanData.chaosValue = item.chaosValue;
        }
        if (item.hasOwnProperty("divineValue")) {
            cleanData.divineValue = item.divineValue;
        }
        if (item.hasOwnProperty("explicitModifiers")) {
            cleanData.explicitModifiers = item.explicitModifiers;
        }
        if (item.hasOwnProperty("stackSize")) {
            cleanData.stackSize = item.stackSize;
        }
        if (item.hasOwnProperty("mapTier")) {
            cleanData.mapTier = item.mapTier;
        }
        if (item.hasOwnProperty("corrupted")) {
            cleanData.corrupted = item.corrupted;
        }
        if (item.hasOwnProperty("gemLevel")) {
            cleanData.gemLevel = item.gemLevel;
        }
        if (item.hasOwnProperty("gemQuality")) {
            cleanData.gemQuality = item.gemQuality;
        }
        if (item.hasOwnProperty("variant")) {
            cleanData.variant = item.variant;
        }
        if (item.hasOwnProperty("links")) {
            cleanData.links = item.links;
        }
        accumulator.push(cleanData);
        return accumulator;
      }, []);

    return newArray;
}

function getSetValue(data){
    function stackXChaos(data){
        // Round off any decimals
        data[i].chaosValue = Math.round(data[i].chaosValue)
        setValue = Math.round(data[i].stackSize * data[i].chaosValue)
        // Create a new attribute in the data to store the set value
        data[i].setValue = setValue
    }
    
    // Loop through the collected div data and calculate the total cost for set of div cards
    for(var i = 0; i < data.length; i++){
        if(data[i].hasOwnProperty("stackSize")){
            data[i].chaosValue = Math.round(data[i].chaosValue)
            stackXChaos(data)
        }else{
            data[i].stackSize = 1
            stackXChaos(data)
        }   
    }
}

function buildTable(data){
    var table = document.getElementById("div-data")
    table.innerHTML = "";

    for (var i = 0; i < 50; i++){
        var row = `<tr>
                        <td><img class="css-mpit4l" title="Divination Card" width="30" height="30" src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png" alt=""><span>  </span>${data[i].name}</td>
                        <td class="data-right">${data[i].stackSize}</td>
                        <td class="data-right">${data[i].chaosValue}<span>  </span><img title="Chaos Orb" width="25" height="25" src="https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?scale=1&w=1&h=1" alt="Chaos Orb"></td>
                        <td class="data-right">${data[i].setValue}<span>  </span><img title="Chaos Orb" width="25" height="25" src="https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?scale=1&w=1&h=1" alt="Chaos Orb"></td>
                        <td class="data-right">${data[i].itemChaosValue}<span>  </span><img title="Chaos Orb" width="25" height="25" src="https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?scale=1&w=1&h=1" alt="Chaos Orb"></td>               
                    </tr>`
        table.innerHTML += row
    }
}

getLeague();
buildItemDatabase(league);
getDivCards(league);

//getItemFromCard()