setcpm(120/4)

$: s("bd ~ bd ~").bank("RolandTR808").gain(.85)

$: s("clave ~ ~ clave ~ clave ~ ~").gain(.35)

$: s("rd*8").gain(.2)

$: s("~ lt ~ ht").bank("RolandTR808").gain(.5)

$: n("0 3 5 7").scale("a:minor").s("sawtooth").lpf(900).release(.2).gain(.4)
