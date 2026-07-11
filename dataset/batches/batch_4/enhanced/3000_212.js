setcpm(100)

$: note("c5 g3 b3 d4").sound("bd hh").lpf(232).room(.5).bank("RolandTR909").gain(.8)

$: s("cp ~ ~ ~ crash ~ ~ ~").room(1).pan(.5526).gain(.2)

$: s("hh*16 hh*16").slow(8.9774).gain(.2)

$: note("C1 F1 G1 C1").lpf(1500).gain(.4)
