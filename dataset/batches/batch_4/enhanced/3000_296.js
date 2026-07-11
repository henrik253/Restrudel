setcpm(37)

$: note("a2*8 a2*8 a2*4 ~").sound("bd rim").lpf(2600).gain(.35)

$: s("supersaw gm_electric_guitar_jazz")

$: s("supersaw white*16").lpf(2594).room(1).gain(.8)

$: n("1 3 0@3 ~ -7 0 1 2 3 4 -3 -2 -1 0 -7 -1 -3 ~ -4 ~ -5 ~ -6 -5 -7@3 ~ 0 1").scale("c4:minor").s("woodblock:1 woodblock:2*2").slow(2)
