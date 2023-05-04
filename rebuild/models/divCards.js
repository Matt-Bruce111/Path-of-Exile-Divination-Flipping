const axios = require("axios");

// Get All
async function getDivCards(league){

    // Get the league id
    var league = await getLeague()
    console.log(`Selected League: ${league}`)

    // Build item database for matching div cards to items
    const itemDB = await buildItemDatabase(league);

    // Init divCards array
    var divCards = [];

    // Configure request options
    const options = {
        method: 'GET',
        url: `https://poe.ninja/api/data/itemoverview?league=${league}&type=DivinationCard&language=en`,
        headers: {
            // Set user agent, otherwise the request will return a 403
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
        }
    }

    // Make the request
    const res = await axios.request(options)

    // Clean the data
    var data = res.data.lines
    data = cleanData(data)

    // Push all cards to the divCards array
    for (i = 0; i < data.length; i++) {
        divCards.push(data[i])
    }

    // Get the set value for each div card
    getSetValue(divCards)
    // Get the item name from the explicit modifier of the card ### Currently incorrectly identifies alot of items
    getItemFromCard(divCards)
    // Add the price data from the item database to the matching div cards
    addPriceDataToCards(itemDB, divCards)
    // Remove any cards with the disabled property
    removeDisabledCards(divCards)

    console.log(`Divination Cards Returned: ${divCards.length}`)
    return divCards
}

//getLeague will call the official pathofexile league api and select the softcore league id (Currently hardcoded as response[8])
// In future all leagues will be returned and the user will be able to select which league they want to use
async function getLeague(){
    const options = {
        method: 'GET',
        url: 'https://api.pathofexile.com/leagues?type=main&compact=1',
        headers: {
            // Set user agent, otherwise the request will return a 403
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
        }
    }
    // Make the request
    const res = await axios.request(options)
    
    // Set the league to the softcore league id
    const league = res.data[8].id
    return league
}

// Compile all the item data from poe.ninja into one large array
async function buildItemDatabase(league){
    const typeTag = ["Oil", "Incubator", "Scarab", "Fossil", "Resonator", "Essence", "DivinationCard", "SkillGem", "BaseType", 
    "HelmetEnchant", "UniqueMap", "UniqueJewel", "UniqueFlask", "UniqueWeapon", "UniqueArmour", "UniqueAccessory", "Beast"]
    
    const currencyTypeTag = ["Currency", "Fragment"]

    console.log(`-- Building Item Database --`)

    var itemDB = []

    for (i = 0; i < typeTag.length; i++){
        const options = {
            method: 'GET',
            url: `https://poe.ninja/api/data/itemoverview?league=${league}&type=${typeTag[i]}&language=en`,
            headers: {
                // Set user agent, otherwise the request will return a 403
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
            }
        }
        
        // Make the request
        const res = await axios.request(options)

        var data = res.data.lines
        data = cleanData(data)

        for (j = 0; j < data.length; j++){
            itemDB.push(data[j])
        }
    }

    for (i = 0; i < currencyTypeTag.length; i++){
        const options = {
            method: 'GET',
            url: `https://poe.ninja/api/data/currencyoverview?league=${league}&type=${currencyTypeTag[i]}&language=en`,
            headers: {
                // Set user agent, otherwise the request will return a 403
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
            }
        }
        
        // Make the request
        const res = await axios.request(options)

        var data = res.data.lines
        data = cleanData(data)

        for (j = 0; j < data.length; j++){
            itemDB.push(data[j])
        }
    }

    console.log(`-- Database Created with ${itemDB.length} Items --`)

    // Return the full itemDB        
    return itemDB
}

// Extract the item name from the div card
function getItemFromCard(divCards){
    for (var i = 0; i < divCards.length; i++){
        var explicitString = divCards[i].explicitModifiers[0].text;
        var start = explicitString.search("{");
        var end = explicitString.search("}");
        itemName = explicitString.slice(start + 1, end);

        // Check if reward item is corrupted
        if(explicitString.includes("Corrupted")){
            divCards[i].corrupted = true;
        } else {
            divCards[i].corrupted = false;
        }

        // Check if item has 2 implicits
        if(explicitString.includes("Two-Implicit")){
            divCards[i].nImplicits = 2;
        }
        
        // Check if a div card rewards more than 1 item
        if (itemName.match(/^\d/)) {
            //console.log(itemName)
            // Get the itemQty from the itemName string
            x = itemName.search("x");
            itemQty = itemName.slice(0, x);
            //console.log(`Item Qty: ${itemQty}`)

            // Remove the Qty from the itemName string
            itemName = itemName.slice(x + 2);
            //console.log(`Item Name: ${itemName}`)

            // Add new properties to card
            divCards[i].itemName = itemName;
            divCards[i].itemQty = +itemQty;
         } else {
            divCards[i].itemName = itemName;
         }
    }
    // console.log(itemDB)
}

// Search for the an item in the itemDB
function search(itemName, itemDB){
    for (let i=0; i < itemDB.length; i++) {
        if (itemDB[i].name === itemName) {
            // console.log(itemDB[i].chaosValue)
            return itemDB[i];
        }
    }
}

// Find any cards that have been disabled
function removeDisabledCards(divCards){
    for (let i=0; i < divCards.length; i++) {
        if (divCards[i].itemName === "Disable") {
            // console.log(divCards[i]);
            var index = i;
            if (index > -1) { // only splice array when item is found
                divCards.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
    }
}

// Match div card rewards to items in the database and add the their respective values to the divcard
function addPriceDataToCards(itemDB, divCards){
    var failCount = 0
    for (let i = 0; i < divCards.length; i++){
        if(divCards[i].hasOwnProperty("corrupted")){

        }
        priceData = search(divCards[i].itemName, itemDB)
        
        //console.log(priceData)
        if (priceData === undefined){
            // console.log("Couldnt find Item Value")
            failCount += 1
        } else {
            if (divCards[i].hasOwnProperty("itemQty")) {
                divCards[i].itemChaosValue = Math.round(priceData.chaosValue * divCards[i].itemQty)
            } else {
                divCards[i].itemChaosValue = Math.round(priceData.chaosValue)
                divCards[i].itemDivValue = Math.round(priceData.divineValue)
            }
        }
        // Calculate profit
        divCards[i].profit = divCards[i].itemChaosValue - divCards[i].setValue
        beforeRound = (divCards[i].profit / divCards[i].setValue) * 100
        divCards[i].profitPercentage = Math.round((beforeRound * 100) / 100)
    }
    console.log(`-- Failed to provide Item Value for ${failCount} items --`)
}

// WIP For searching items such as Corrupted Mageblood
async function searchItem(itemName, corrupted){
    var url = 'https://www.pathofexile.com/api/trade/search/Sanctum';

    // Use proxy url to avoid registering app
    const proxyUrl = "https://corsproxy.io/?";
    const firstRequest = proxyUrl + encodeURIComponent(url);

    var name = "Mageblood";
    var type = "Heavy Belt";

    const data = `{
    "query": {
        "status": { "option": "online" },
        "name": "${name}",
        "filters":{
            "misc_filters":{
               "filters":{
                  "corrupted":{
                     "option":"true"
                  }
               },
               "disabled":false
            }
         }
    },
    "sort": { "price": "asc" }
    }`;
    
    // First response for fetching all the itemIDs
    const firstResponse = await fetch(firstRequest, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            //'cookies': 'POESESSID=9cfb841bfd9690ffaec900f14207fb12'
        },
        body: data,
    });

    const text = await firstResponse.json();

    // Query id goes at the end of the url after all the itemIDs
    var queryID = text.id;
    var itemIDS = "";

    // Loop through results to create id string seperated by commas
    // Can only fetch the first 10 items due to trade api being limited
    for(i = 0; i < 9; i++){
        if(i < text.result.length - 1){
            itemIDS += `${text.result[i]},`
        } else {
            itemIDS += `${text.result[i]}`
        }
    }

    // console.log(itemIDS);
    // console.log(text.id);

    // Add the ids into the api fetch endpoint string
    url = `https://www.pathofexile.com/api/trade/fetch/${itemIDS}?query=${queryID}`

    const secondRequest = proxyUrl + url;

    // Try to fetch the item details, CURRENTLY NOT WORKING (Invalid Query, Manually call api through trade site to compare requests)
    const secondResponse = await fetch(secondRequest, {
        method: 'GET',
        headers: {
            'content-type': 'application/json'
            //'cookies': 'POESESSID=9cfb841bfd9690ffaec900f14207fb12'
        }
    });

    const fetchedItems = await secondResponse.json();

    console.log(fetchedItems);
}

// ############ NOT CURRENTLY WORKING ############
// Nodejs not understanding 'reduce', probably a jquery thing
// cleanData will go thorugh the JSON recieved from the poe.ninja api and cull any of the unneeded data.
function cleanData(data){
    let newArray = data.reduce((accumulator, item) => {
        let cleanData = {};
        if (item.hasOwnProperty("name")) {
            cleanData.name = item.name;
        }
        if (item.hasOwnProperty("currencyTypeName")) {
            cleanData.name = item.currencyTypeName;
        }
        if (item.hasOwnProperty("chaosValue")) {
            cleanData.chaosValue = item.chaosValue;
        }
        if (item.hasOwnProperty("chaosEquivalent")) {
            cleanData.chaosValue = item.chaosEquivalent;
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
                        <td class="data-right">${data[i].profit}<span>  </span><img title="Chaos Orb" width="25" height="25" src="https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?scale=1&w=1&h=1" alt="Chaos Orb"></td>
                        <td class="data-right">${data[i].profitPercentage}<span> % </span></td>                  
                    </tr>`
        table.innerHTML += row
    }
}

// getLeague();
// buildItemDatabase(league);
// getDivCards(league);

module.exports = {
    getLeague,
    buildItemDatabase,
    getDivCards
}