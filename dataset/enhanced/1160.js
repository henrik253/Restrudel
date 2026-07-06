setcpm(108/4)

$: s("bd ~ bd ~ sd ~ ~ ~").bank("RolandTR808").gain(.85)

$: s("rd*3 ~").gain(.25).pan(.6)

$: note("c2 ~ c2 g2 c2 ~ eb2 f2").s("gm_bassoon").lpf(300).release(.3).clip(.85).gain(.4)

$: note("<c4 g4 ab4 bb4>").s("gm_pad_bowed:1").lpf(2000).room(.6).release(.5).gain(.35)
