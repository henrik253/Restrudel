setcpm(120/4)
$: s("bd ~ sd ~").gain(.75)
$: s("hh*16").slow(2).gain(.2)
$: note("b2 f2").sound("supersaw").lpf(1800).gain(.3)
