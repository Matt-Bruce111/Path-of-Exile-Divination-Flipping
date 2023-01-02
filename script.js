// Get All
function getDivCards(){
    $.ajax({
    url: "https://poe.ninja/api/data/itemoverview?league=Sanctum&type=DivinationCard&language=en",    
    method: "GET",
    success:function(response){
        data = response
        getSetValue(data)
        buildTable(data)
        console.log(data)
    }})
}

function getSetValue(data){
    for(var i = 0; i < 50; i++){
        if(data.lines[i].hasOwnProperty("stackSize")){
            data.lines[i].chaosValue = Math.round(data.lines[i].chaosValue)
            setValue = Math.round(data.lines[i].stackSize * data.lines[i].chaosValue)
            data.lines[i].setValue = setValue
        }else{
            data.lines[i].stackSize = 1
            setValue = Math.round(data.lines[i].stackSize * data.lines[i].chaosValue)
            data.lines[i].setValue = setValue
        }   
    }
}

function buildTable(data){
    var table = document.getElementById("div-data")
    table.innerHTML = "";

    for (var i = 0; i < 50; i++){
        var row = `<tr>
                        <td><img class="css-mpit4l" title="Divination Card" width="30" height="30" src="https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8cbb5/InventoryIcon.png" alt=""><span>  </span>${data.lines[i].name}</td>
                        <td class="data-right">${data.lines[i].stackSize}</td>
                        <td class="data-right">${data.lines[i].chaosValue}<span>  </span><img title="Chaos Orb" width="25" height="25" src="https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?scale=1&w=1&h=1" alt="Chaos Orb"></td>
                        <td class="data-right">${data.lines[i].setValue}<span>  </span><img title="Chaos Orb" width="25" height="25" src="https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?scale=1&w=1&h=1" alt="Chaos Orb"></td>               
                    </tr>`
        table.innerHTML += row
    }
}

getDivCards();