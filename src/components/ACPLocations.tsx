import { Image, Text } from 'components/shared'
import { classNames } from 'utils/classNames'

export default function ACPLocations({ shouldShowPhoneNumber = false }) {
  const locations = {
    'Central Area': [
      { name: 'Alexandra Hospital', phones: ['6370 6029'] },
      { name: "KK Women's and Children's Hospital", phones: ['9060 0375'] },
      { name: 'National Heart Centre of Singapore', phones: ['8299 3548'] },
      { name: 'Singapore General Hospital', phones: ['6576 2152'] },
      { name: 'Tan Tock Seng Hospital', phones: ['6359 6410', '6359 6411'] },
      { name: 'Outram Polyclinic', phones: ['6643 6969'] },
      { name: 'Toa Payoh Polyclinic', phones: ['6355 3000'] },
      { name: '@ 27 Family Service Centre', phones: ['6270 8327'] },
      { name: 'GoodLife! @ Telok Blangah', phones: ['6274 6904'] },
      { name: 'Family Central (Tiong Bahru)', phones: ['6593 6456'] },
      {
        name: 'Fei Yue Senior Activity Centre (Holland Close)',
        phones: ['6774 4044'],
      },
      {
        name: 'Fei Yue Senior Activity Centre (Commonwealth)',
        phones: ['6471 2022'],
      },
      { name: 'Brahm Centre @ Novena', phones: ['6258 0831'] },
      { name: 'GoodLife! @ Kreta Ayer', phones: ['6904 9285'] },
      { name: 'Kreta Ayer Family Services', phones: ['6325 4753'] },
      { name: 'Life Point @ Chinatown Point', phones: ['6538 9877'] },
      {
        name: 'SATA CommHealth - Potong Pasir Medical Centre',
        phones: ['6244 6688'],
      },
      { name: 'GoodLife! @ Central', phones: ['6926 0350'] },
    ],
    'East Area': [
      { name: 'Changi General Hospital', phones: ['6850 4567'] },
      { name: 'Bedok Polyclinic', phones: ['6643 6969'] },
      { name: 'Geylang Polyclinic', phones: ['6547 6456'] },
      { name: 'C3 Family Clinic', phones: ['6742 2285'] },
      { name: 'Brahm Centre @ MacPherson', phones: ['6741 1131'] },
      { name: 'Brahm Centre @ Simei', phones: ['6786 0800'] },
      { name: 'Brahm Centre @ Tampines', phones: ['6908 2122'] },
      { name: 'GoodLife! @ Bedok', phones: ['6312 3988'] },
      { name: 'GoodLife! Makan', phones: ['6702 0212'] },
      { name: 'GoodLife! @ Marine Parade', phones: ['6445 0570'] },
      { name: 'Marine Parade Family Service Centre', phones: ['6445 0100'] },
      {
        name: 'SATA CommHealth - Uttamram Medical Centre (Bedok)',
        phones: ['6244 6688'],
      },
    ],
    'North East Area': [
      { name: 'Sengkang General Hospital', phones: ['6930 2583'] },
      { name: 'Hougang Polyclinic', phones: ['6355 3000'] },
      { name: 'Fei Yue @ Buangkok Green', phones: ['6914 2166'] },
      { name: 'Fei Yue @ Hougang Dewcourt', phones: ['6202 4699'] },
      {
        name: 'Fei Yue Senior Activity Centre (Hougang)',
        phones: ['6538 0234'],
      },
      {
        name: 'Hougang Sheng Hong Family Service Centre',
        phones: ['6289 5022'],
      },
      {
        name: 'SATA CommHealth - Ang Mo Kio Medical Centre',
        phones: ['6244 6688'],
      },
    ],
    'North Area': [
      { name: 'Khoo Teck Puat Hospital', phones: ['6555 8000'] },
      { name: 'Ang Mo Kio Polyclinic', phones: ['6355 3000'] },
      { name: 'Woodlands Polyclinic', phones: ['6202 4699'] },
      { name: 'Yishun Polyclinic', phones: ['6355 3000'] },
      { name: 'GoodLife! @ Yishun', phones: ['6484 8040'] },
      {
        name: 'SATA CommHealth - Woodlands Medical Centre',
        phones: ['6244 6688'],
      },
      {
        name: 'Wellness Kampung @ 765 Nee Soon Central',
        phones: ['6257 4842'],
      },
    ],
    'West Area': [
      { name: 'National University Hospital', phones: ['6779 5555'] },
      { name: 'Ng Teng Fong General Hospital', phones: ['9622 5889'] },
      { name: 'Bukit Batok Polyclinic', phones: ['6355 3000'] },
      { name: 'Choa Chu Kang Polyclinic', phones: ['6355 3000'] },
      { name: 'Jurong Polyclinic', phones: ['6355 3000'] },
      { name: 'Pioneer Polyclinic', phones: ['6355 3000'] },
      { name: 'Queenstown Polyclinic', phones: ['6355 3000'] },
      { name: 'Choa Chu Kang Fei Yue Retirees Centre', phones: ['6769 6981'] },
      { name: 'Fei Yue @ Limbang Green', phones: ['6661 9499'] },
      {
        name: 'Fei Yue Senior Activity Centre @ 183 Bukit Batok Ave 8',
        phones: ['6561 4404'],
      },
      {
        name: 'Fei Yue Senior Activity Centre @ 210A Bukit Batok St 21',
        phones: ['6563 3662'],
      },
      {
        name: 'Fei Yue Senior Activity Centre (Limbang)',
        phones: ['6659 0616'],
      },
      { name: 'Fei Yue Senior Activity Centre (Senja)', phones: ['6351 9555'] },
      {
        name: 'Fei Yue Senior Activity Centre @ 9 Teck Whye Lane',
        phones: ['6893 6606'],
      },
      {
        name: 'Fei Yue Senior Activity Centre @ 165A Teck Whye',
        phones: ['6380 9155'],
      },
      { name: 'Fei Yue @ Sunshine Court', phones: ['6334 0180'] },
      {
        name: 'SATA CommHealth - Jurong Medical Centre',
        phones: ['6244 6688'],
      },
    ],
  }

  return (
    <div>
      <div className='AspectRatio _16-9'>
        <Image alt='' src='/assets/gifs/spokesperson-light.gif' />
      </div>
      <br />
      <Text className='color-dark text-center' element='p'>
        Your wishes and beliefs can easily be officialised in your ACP at the
        following healthcare institutions:
      </Text>
      <br />
      {Object.entries(locations).map(([area, locations]) => (
        <details key={area} className='ACPLcations mb-24'>
          <summary
            className='flex justify-between background-light rounded-8 items-center px-24'
            style={{ height: '3rem' }}
          >
            <Text as='h6' className='color-dark fw-700' element='h3'>
              {area}
            </Text>
          </summary>
          <ul className='px-24 pt-16'>
            {locations.map(({ name, phones }) => (
              <li
                key={name}
                className={classNames(shouldShowPhoneNumber && 'mb-8')}
              >
                <Text className='color-dark' element='p'>
                  {shouldShowPhoneNumber ? (
                    <>
                      <strong>{name}</strong>
                      <br />
                      {!!phones.length &&
                        phones
                          .map((phone) => (
                            <a
                              key={phone}
                              className='color-dark underline'
                              href={`tel:+65 ${phone}`}
                            >
                              {phone}
                            </a>
                          ))
                          .reduce((prev, curr) => [prev, ' / ', curr])}
                    </>
                  ) : (
                    name
                  )}
                </Text>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
