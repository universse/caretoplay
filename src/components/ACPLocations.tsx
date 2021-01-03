import Image from 'next/image'

import { Text } from 'components/shared'

export default function ACPLocations() {
  const locations = {
    'Central Area': [
      'Alexandra Hospital',
      "KK Women's and Children's Hospital",
      'National Heart Centre of Singapore',
      'Singapore General Hospital',
      'Tan Tock Seng Hospital',
      'Outram Polyclinic',
      'Toa Payoh Polyclinic',
      '@ 27 Family Service Centre',
      'GoodLife! @ Telok Blangah',
      'Family Central (Tiong Bahru)',
      'Fei Yue Senior Activity Centre (Holland Close)',
      'Fei Yue Senior Activity Centre (Commonwealth)',
      'Brahm Centre @ Novena',
      'GoodLife! @ Kreta Ayer',
      'Kreta Ayer Family Services',
      'Life Point @ Chinatown Point',
      'SATA CommHealth - Potong Pasir Medical Centre',
      'GoodLife! @ Central',
    ],
    'East Area': [
      'Changi General Hospital',
      'Bedok Polyclinic',
      'Geylang Polyclinic',
      'Brahm Centre @ MacPherson',
      'Brahm Centre @ Simei',
      'Brahm Centre @ Tampines',
      'GoodLife! @ Bedok',
      'GoodLife! Makan',
      'GoodLife! @ Marine Parade',
      'Marine Parade Family Service Centre',
      'SATA CommHealth - Uttamram Medical Centre (Bedok)',
    ],
    'North East Area': [
      'Sengkang General Hospital',
      'Hougang Polyclinic',
      'Fei Yue @ Buangkok Green',
      'Fei Yue @ Hougang Dewcourt',
      'Fei Yue Senior Activity Centre (Hougang)',
      'Hougang Sheng Hong Family Service Centre',
      'SATA CommHealth - Ang Mo Kio Medical Centre',
    ],
    'North Area': [
      'Khoo Teck Puat Hospital',
      'Ang Mo Kio Polyclinic',
      'Woodlands Polyclinic',
      'Yishun Polyclinic',
      'GoodLife! @ Yishun',
      'SATA CommHealth - Woodlands Medical Centre',
      'Wellness Kampung @ 765 Nee Soon Central',
    ],
    'West Area': [
      'National University Hospital',
      'Ng Teng Fong General Hospital',
      'Bukit Batok Polyclinic',
      'Choa Chu Kang Polyclinic',
      'Jurong Polyclinic',
      'Pioneer Polyclinic',
      'Queenstown Polyclinic',
      'Choa Chu Kang Fei Yue Retirees Centre',
      'Fei Yue @ Limbang Green',
      'Fei Yue Senior Activity Centre @ 183 Bukit Batok Ave 8',
      'Fei Yue Senior Activity Centre @ 210A Bukit Batok St 21',
      'Fei Yue Senior Activity Centre (Limbang)',
      'Fei Yue Senior Activity Centre (Senja)',
      'Fei Yue Senior Activity Centre @ 9 Teck Whye Lane',
      'Fei Yue Senior Activity Centre @ 165A Teck Whye',
      'Fei Yue @ Sunshine Court',
      'SATA CommHealth - Jurong Medical Centre',
    ],
  }

  return (
    <div>
      <div className='AspectRatio _16-9'>
        <Image
          alt=''
          layout='fill'
          objectFit='cover'
          src={`/assets/gifs/quiz-09.gif`}
        />
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
            {locations.map((location) => (
              <li key={location}>
                <Text className='color-dark' element='p'>
                  {location}
                </Text>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
