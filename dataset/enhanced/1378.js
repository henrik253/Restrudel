setcpm(115/4)

$: s("bd ~ ~ bd sd ~ bd ~").gain(.8)

$: s("lt mt lt lt mt*2 lt*2 lt lt").gain(.45)

$: s("~ ~ cowbell ~").gain(.3)

$: note("c2 ~ c2 eb2 ~ g1 ~ ~").s("square").lpf(600).release(.15).gain(.45)

$: s("hh*8").gain(.15)
