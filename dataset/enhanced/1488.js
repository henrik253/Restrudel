setcpm(108/4)

$: note("a4@3 [g4 e4]").s("sawtooth").lpf(1700).room(.5).release(.25).gain(.35)

$: note("a1 a1 ~ a1 ~ a1 c2 ~").s("pulse").lpf(700).release(.12).gain(.45)

$: s("clave ~ ~ clave ~ ~ clave ~").gain(.3)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*4").gain(.15)
