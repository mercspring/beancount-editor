// $(".amount").dblclick(function(){
//     $(this).replaceWith(`<input value=${$(this).text()}>`)
// })

$(".transaction").on("dblclick", function(){
    console.log($(this).children(".info"))
})