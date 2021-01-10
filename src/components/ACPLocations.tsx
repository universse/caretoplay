import { Image, Text } from 'components/shared'

export default function ACPLocations() {
  const locations = {
    'Central Area': [
      { name: 'Alexandra Hospital' },
      { name: "KK Women's and Children's Hospital" },
      { name: 'National Heart Centre of Singapore' },
      { name: 'Singapore General Hospital' },
      { name: 'Tan Tock Seng Hospital' },
      { name: 'Outram Polyclinic' },
      { name: 'Toa Payoh Polyclinic' },
      { name: '@ 27 Family Service Centre' },
      { name: 'GoodLife! @ Telok Blangah' },
      { name: 'Family Central (Tiong Bahru)' },
      { name: 'Fei Yue Senior Activity Centre (Holland Close)' },
      { name: 'Fei Yue Senior Activity Centre (Commonwealth)' },
      { name: 'Brahm Centre @ Novena' },
      { name: 'GoodLife! @ Kreta Ayer' },
      { name: 'Kreta Ayer Family Services' },
      { name: 'Life Point @ Chinatown Point' },
      { name: 'SATA CommHealth - Potong Pasir Medical Centre' },
      { name: 'GoodLife! @ Central' },
    ],
    'East Area': [
      { name: 'Changi General Hospital' },
      { name: 'Bedok Polyclinic' },
      { name: 'Geylang Polyclinic' },
      { name: 'Brahm Centre @ MacPherson' },
      { name: 'Brahm Centre @ Simei' },
      { name: 'Brahm Centre @ Tampines' },
      { name: 'GoodLife! @ Bedok' },
      { name: 'GoodLife! Makan' },
      { name: 'GoodLife! @ Marine Parade' },
      { name: 'Marine Parade Family Service Centre' },
      { name: 'SATA CommHealth - Uttamram Medical Centre (Bedok)' },
    ],
    'North East Area': [
      { name: 'Sengkang General Hospital' },
      { name: 'Hougang Polyclinic' },
      { name: 'Fei Yue @ Buangkok Green' },
      { name: 'Fei Yue @ Hougang Dewcourt' },
      { name: 'Fei Yue Senior Activity Centre (Hougang)' },
      { name: 'Hougang Sheng Hong Family Service Centre' },
      { name: 'SATA CommHealth - Ang Mo Kio Medical Centre' },
    ],
    'North Area': [
      { name: 'Khoo Teck Puat Hospital' },
      { name: 'Ang Mo Kio Polyclinic' },
      { name: 'Woodlands Polyclinic' },
      { name: 'Yishun Polyclinic' },
      { name: 'GoodLife! @ Yishun' },
      { name: 'SATA CommHealth - Woodlands Medical Centre' },
      { name: 'Wellness Kampung @ 765 Nee Soon Central' },
    ],
    'West Area': [
      { name: 'National University Hospital' },
      { name: 'Ng Teng Fong General Hospital' },
      { name: 'Bukit Batok Polyclinic' },
      { name: 'Choa Chu Kang Polyclinic' },
      { name: 'Jurong Polyclinic' },
      { name: 'Pioneer Polyclinic' },
      { name: 'Queenstown Polyclinic' },
      { name: 'Choa Chu Kang Fei Yue Retirees Centre' },
      { name: 'Fei Yue @ Limbang Green' },
      { name: 'Fei Yue Senior Activity Centre @ 183 Bukit Batok Ave 8' },
      { name: 'Fei Yue Senior Activity Centre @ 210A Bukit Batok St 21' },
      { name: 'Fei Yue Senior Activity Centre (Limbang)' },
      { name: 'Fei Yue Senior Activity Centre (Senja)' },
      { name: 'Fei Yue Senior Activity Centre @ 9 Teck Whye Lane' },
      { name: 'Fei Yue Senior Activity Centre @ 165A Teck Whye' },
      { name: 'Fei Yue @ Sunshine Court' },
      { name: 'SATA CommHealth - Jurong Medical Centre' },
    ],
  }

  return (
    <div>
      <div className='AspectRatio _16-9'>
        <Image alt='' src='/assets/gifs/spokesperson-light.webp' />
      </div>
      <br />
      <Text className='color-dark text-center' element='p'>
        Your wishes and beliefs can easily be officialised in your ACP at the
        following healthcare institutions:
      </Text>
      <br />
      {Object.entries(locations).map(([area, locations]) => (
        <details key={area} className='ACPLcations mb-16'>
          <summary
            className='flex justify-between background-light rounded-8 items-center px-24'
            style={{ height: '3rem' }}
          >
            <Text as='h6' className='color-dark fw-700' element='h3'>
              {area}
            </Text>
          </summary>
          <ul className='px-24 pt-16'>
            {locations.map(({ name, phone }) => (
              <li key={name}>
                <Text className='color-dark' element='p'>
                  {name}
                </Text>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
