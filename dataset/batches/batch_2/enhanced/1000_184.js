setcpm(90/4)

$: s("cowbell ~ cowbell ~").attack(.001).gain(.7)

$: note("c2 ~ c2 ~").s("triangle").slow(2).lpf(600).gain(.4)

$: n("0 3 5 7").scale("C:minor").s("gm_overdriven_guitar").release(.2).gain(.3)

$: s("hh*8").gain(.2).degradeBy(.3)
