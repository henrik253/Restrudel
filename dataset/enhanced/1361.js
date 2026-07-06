setcpm(124/4)

$: s("bd*4 ~").bank("AkaiLinn").gain(.85)

$: s("~ sd ~ sd").bank("AkaiLinn").gain(.5)

$: s("hh*8").bank("AkaiLinn").gain(.18)

$: n("0").sound("supersaw").lpf(2600).hpf(200).release(.3).room(.3).gain(.5)

$: n("4 3 2 3 2 1 0 -1 -2 0 -1 0").s("square").slow(2).scale("c:minor").lpf(700).release(.2).gain(.4)
