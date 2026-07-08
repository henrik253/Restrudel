setcpm(102/4)

$: n("0 ~ 2 3 ~ 4 ~ 2").scale("g:minor").s("bell").release(.3).room(.5).gain(.3)

$: s("oh:2*8").gain("[.2 .12]*4")

$: n("7 9 10 9").scale("g:minor").s("psaltery_pluck").release(.1).delay(.4).gain(.35).slow(2)

$: n("<[0,2,4] [-3,-1,2]>").scale("g:minor").s("gm_choir_aahs:6").attack(.4).release(1).gain(.2).room(.9)

$: s("bd ~ ~ bd sd ~ ~ ~").gain(.75)
