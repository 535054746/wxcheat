function changePrice(num) {
  num = num.toString().replace(/\$|\,/g, '');
  return num;
}
function toDecimal2(s) {
  var n = 2;
  n = n > 0 && n <= 20 ? n : 2;
  s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
  var l = s.split(".")[0].split("").reverse(),
    r = s.split(".")[1];
  var t = "";
  for (var i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
  }
  return t.split("").reverse().join("") + "." + r;
}

module.exports.toDecimal2 = toDecimal2;
module.exports.changePrice = changePrice;