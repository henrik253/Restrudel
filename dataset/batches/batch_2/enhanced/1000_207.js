setcpm(90/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("vocal:1 ~ vocal:2 ~").slow(2).gain(.3)

$: note("g5 eb5 ~ ~").sound("piano").velocity(.6).room(.3)

$: note("a5 c6 ~ ~").sound("piano").velocity(.5).release(.4)
